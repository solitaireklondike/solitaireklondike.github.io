        var hh = 0;
        var mm = 0;
        var ss = 0;
        var timeString ='';

        //var clickAble = false;

        var cardList = [];
        var pileList = [];
        var loadedImgCount = 0;
        var loadImgTimeout = 5000;
        var cardWidth;
        var cardHeight;
        var originalCardWidth;
        var originalCardHeight;
        var pileGapX;
        var pileGapY;
        var pileGapScaleX = 0.2;
        var pileGapScaleY = 0.2;
        var oldPile;
        var oldPosition;
        var isMenuShown;
        var originalPile6OffsetX;
        var originalPile6OffsetY;
        var backImg;
        var cardsmaskImg;
        var cardmaskImg;
        var cardColors = ["black", "heart", "club", "diamond"];
        var cardIndexs = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k"];
        var canvasBack = document.getElementById("canvasBack");
        var canvasFont = document.getElementById("canvasFont");
        var ctxBack = canvasBack.getContext("2d");
        var ctxFont = canvasFont.getContext("2d");
        var isMouseDown = false;
        var pointDown = {};
        var pointDownTime;
        var pointDownInterval;
        var isPlayingAnimation = false;
        var gameStartTime;
        var gameInterval;
        var isGameFinished = false;

        var startAnimation = true;

        var score =0; 

        var audio = document.createElement("audio");
        audio.src = "./sound/dealVoice.mp3";

        var Pile = function (index, position, offsetX, offsetY)
        {
            var obj = new Object();
            obj.Index = index;
            obj.Position = position;
            obj.OffsetX = offsetX;
            obj.OffsetY = offsetY;
            obj.CardList = [];
            return obj;
        }

        var Card = function (type, index, indexOfPile, position, faceImgUrl, showFace)
        {
            var obj = new Object();
            obj.Type = type;
            obj.Index = index;
            obj.IndexOfPile = indexOfPile;
            obj.Position = position;
            var img = document.createElement("img");
            img.src = faceImgUrl;
            obj.Img = img;
            obj.ShowFace = showFace;
            obj.Pile = {};
            obj.Color = 0;
            if (type == 1 || type == 3)
            {
                obj.Color = 1;
            }
            return obj;
        }

        var Position = function (x, y)
        {
            var obj = new Object();
            obj.X = x;
            obj.Y = y;
            return obj;
        }

        function LoadCardImage()
        {
            var backBitmapUrl = "./image/poker/back.png";
            backImg = document.createElement("img");
            $(backImg).load(function ()
            {
                originalCardWidth = backImg.width;
                originalCardHeight = backImg.height;
                loadedImgCount++;
            }).error(function ()
            {
                //ShowMessage("Sorry, failed to load image resource.", false);
            });

            var cardmaskUrl = "./image/poker/cardmask.png";
            cardmaskImg = document.createElement("img");
            cardmaskImg.src = cardmaskUrl;

            var cardsmaskUrl = "./image/poker/cards.png";
            cardsmaskImg = document.createElement("img");
            cardsmaskImg.src = cardsmaskUrl;


            backImg.src = backBitmapUrl;
            for (var i = 0; i < 4; i++)
            {
                var cardTypeDir = "./image/" + cardColors[i] + "/";
                for (var j = 0; j < 13; j++)
                {
                    var cardIndexName = cardIndexs[j];
                    var card = new Card(i, j, null, null, cardTypeDir + cardIndexName + ".png", false);
                    cardList.push(card);
                }
            }
            for (var i = 0; i < cardList.length; i++)
            {
                $(cardList[i].Img).load(function ()
                {
                    loadedImgCount++;
                }).error(function ()
                {
                    //ShowMessage("Sorry, failed to load image resource.", false);
                });
            }
        }

        function IniPileList()
        {
            for (var i = 0; i < 14; i++)
            {
                var pile = new Pile(i);
                pileList.push(pile);
            }
            SortPileList();
        }

        function IniPileListPosition()
        {
            var deskTopPaddingX = 10;
            var deskTopWidth = $("#deskTop").width() - deskTopPaddingX * 2;
            var multiScale = deskTopWidth / (originalCardWidth * 7 + originalCardWidth * pileGapScaleX * 6);
            if (multiScale > 1)
            {
                deskTopPaddingX += (deskTopWidth - (originalCardWidth * 7 + originalCardWidth * pileGapScaleX * 6)) / 2;
                multiScale = 1;
            }
            cardWidth = originalCardWidth * multiScale;
            pileGapX = cardWidth * pileGapScaleX;
            cardHeight = originalCardHeight * multiScale;
            pileGapY = cardHeight * pileGapScaleY;
            for (var i = 0; i < 7; i++)
            {
                pileList[i + 7].Position = new Position((cardWidth + pileGapX) * i, cardHeight + pileGapY);
                pileList[i + 7].OffsetX = 0;
                pileList[i + 7].OffsetY = cardHeight / 6;  //card gap
            }
            pileList[0].Position = new Position(0, 0);
            pileList[0].OffsetX = 0;
            pileList[0].OffsetY = 0;
            pileList[1].Position = new Position(cardWidth + pileGapX, 0);
            pileList[1].OffsetX = cardWidth / 2;
            pileList[1].OffsetY = 0;
            for (var i = 0; i < 4; i++)
            {
                pileList[i + 2].Position = new Position((cardWidth + pileGapX) * (3 + i), 0);
                pileList[i + 2].OffsetX = 0;
                pileList[i + 2].OffsetY = 0;
            }
            pileList[6].Position = null;
            pileList[6].OffsetX = 0;
            pileList[6].OffsetY = cardHeight / 6;
            for (var i = 0; i < pileList.length; i++)
            {
                if (pileList[i].Position)
                {
                    pileList[i].Position = new Position(pileList[i].Position.X + deskTopPaddingX, pileList[i].Position.Y + 10);
                }
            }
        }

        function Shuffle()
        {
            var cardListTemp = [];
            while (cardList.length > 0)
            {
                var r = parseInt(Math.random() * cardList.length);
                cardListTemp.push(cardList[r]);
                cardList.splice(r, 1);
            }
            cardList = cardListTemp;
        }

        function Deal()
        {

            var indexFlag = 0;
            for (var i = 0; i < 7; i++)
            {
                for (var j = 0; j < i; j++)
                {
                    var card = cardList[indexFlag];
                    card.Pile = pileList[7 + i];
                    card.IndexOfPile = j;
                    card.ShowFace = false;
                    indexFlag++;
                }
                var cardTemp = cardList[indexFlag];
                cardTemp.Pile = pileList[7 + i];
                cardTemp.IndexOfPile = i;
                cardTemp.ShowFace = true;
                indexFlag++;
            }
            var indexOfPile0 = 0;
            for (var i = indexFlag; i < cardList.length; i++)
            {
                var cardTemp = cardList[i];
                cardTemp.Pile = pileList[0];
                cardTemp.IndexOfPile = indexOfPile0++;
                cardTemp.ShowFace = false;
            }
        }

        function SetPileCardList()
        {
            for (var i = 0; i < 14; i++)
            {
                pileList[i].CardList = [];
                for (var j = 0; j < cardList.length; j++)
                {
                    if (cardList[j].Pile == pileList[i])
                    {
                        pileList[i].CardList.push(cardList[j]);
                    }
                }
                SortCardList(pileList[i].CardList);
            }
        }

        function SetPileCardListPosition()
        {
            for (var i = 0; i < 14; i++)
            {
                for (var j = 0; j < pileList[i].CardList.length; j++)
                {
                    if (i == 1)
                    {
                        if (pileList[i].CardList[j].ShowFace == false)
                        {
                            pileList[i].CardList[j].Position = new Position(pileList[i].Position.X, pileList[i].Position.Y);
                        }
                        else
                        {
                            var showFaceCount = 0;
                            for (var k = 0; k < pileList[i].CardList.length; k++)
                            {
                                if (pileList[i].CardList[k].ShowFace == true)
                                {
                                    showFaceCount++;
                                }
                            }
                            pileList[i].CardList[j].Position = new Position(pileList[i].Position.X + pileList[i].OffsetX * (showFaceCount - (pileList[i].CardList.length - pileList[i].CardList[j].IndexOfPile)), pileList[i].Position.Y);
                        }
                    }
                    else
                    {
                        pileList[i].CardList[j].Position = new Position(pileList[i].Position.X + pileList[i].CardList[j].IndexOfPile * pileList[i].OffsetX, pileList[i].Position.Y + pileList[i].CardList[j].IndexOfPile * pileList[i].OffsetY);
                    }
                }
            }
        }

        function boardSize() {
            var wH = $(window).height();
            var wW = $(window).width();

            if( wH >= wW){
                $("#deskTop").width( wW );
                $("#deskTop").height( wH );
                //$("#deskTop").height( (wW*4)/5 );
            }else{
                //$("#deskTop").width( (wH*5)/4 );
                $("#deskTop").width( wH );
                $("#deskTop").height( wH );
            }
        }

        function IniDeskTopAndCanvas()
        {

            boardSize();

            canvasBack.width = $("#deskTop").width();
            canvasBack.height = $("#deskTop").height();
            canvasFont.style.display = "none";
        }


        function CardMaskSet(){
            //var cardmask = "./image/poker/cardmask.png";
            //var cardmaskImg = document.createElement("img");
            //cardmaskImg.src = cardmask;

            var temp = cardWidth + (cardWidth / 5);
            var init = temp*3;

            ctxBack.drawImage(cardsmaskImg, pileList[0].Position.X , pileList[0].Position.Y, cardWidth, cardHeight);

            for(var i=0; i<4; i++){
                ctxBack.drawImage(cardmaskImg, init+ pileList[0].Position.X + temp*i, pileList[0].Position.Y, cardWidth, cardHeight);
            }
        }

        function DrawBack()
        {

            ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);


            CardMaskSet();


            if (pileList[0].CardList.length > 0)
            {
                ctxBack.drawImage(backImg, pileList[0].Position.X, pileList[0].Position.Y, cardWidth, cardHeight);
            }
            else
            {
                ctxBack.font = cardWidth / 2 + "px Consolas";
                ctxBack.fillStyle = "#eee";
                var left = pileList[0].Position.X + cardWidth / 4;
                if (pileList[1].CardList.length < 10)
                {
                    left += cardWidth / 7;
                }
                var top = pileList[0].Position.Y + cardHeight * 0.6;
                ctxBack.fillText(pileList[1].CardList.length, left, top);
            }
            var cardListTemp = [];
            for (var i = 0; i < pileList[1].CardList.length; i++)
            {
                if (pileList[1].CardList[i].ShowFace == true)
                {
                    cardListTemp.push(pileList[1].CardList[i]);
                }
            }
            SortCardList(cardListTemp);
            for (var i = 0; i < cardListTemp.length; i++)
            {
                ctxBack.drawImage(cardListTemp[i].Img, pileList[1].Position.X + pileList[1].OffsetX * i, pileList[1].Position.Y, cardWidth, cardHeight);
            }
            for (var i = 2; i < 6; i++)
            {
                if (pileList[i].CardList.length > 0)
                {
                    ctxBack.drawImage(pileList[i].CardList[pileList[i].CardList.length - 1].Img, pileList[i].Position.X, pileList[i].Position.Y, cardWidth, cardHeight);
                }
            }
            for (var i = 0; i < 7; i++)
            {
                for (var j = 0; j < pileList[7 + i].CardList.length; j++)
                {
                    ctxBack.drawImage(pileList[7 + i].CardList[j].ShowFace ? pileList[7 + i].CardList[j].Img : backImg, pileList[7 + i].CardList[j].Position.X, pileList[7 + i].CardList[j].Position.Y, cardWidth, cardHeight);
                }
            }
        }

        function DrawFont()
        {
            canvasFont.style.display = "block";
            ctxFont.clearRect(0, 0, canvasFont.width, canvasFont.height);
            var height = (pileList[6].CardList.length - 1) * pileList[6].OffsetY + cardHeight;
            canvasFont.width = cardWidth;
            canvasFont.height = height;
            for (var i = 0; i < pileList[6].CardList.length; i++)
            {
                ctxFont.drawImage(pileList[6].CardList[i].ShowFace ? pileList[6].CardList[i].Img : backImg, 0, pileList[6].OffsetY * i, cardWidth, cardHeight);
            }

        }

        function IniGame()
        {
            boardSize();
            IniPileList();
            Shuffle();
            Deal();
            SetPileCardList();
            IniPileListPosition();
            SetPileCardListPosition();
            IniDeskTopAndCanvas();
            DealAnimation(7, 0);
        }

        function DealAnimation(i, j)
        {
            if (i > 13)
            {
                $("canvas").remove(".canvasTemp");
                DrawBack();
                CountTime();
                isPlayingAnimation = false;

                startAnimation = false;
                return;
            }
            isPlayingAnimation = true;
            var canvasTemp = document.createElement("canvas");
            canvasTemp.width = cardWidth;
            canvasTemp.height = cardHeight;
            canvasTemp.style.position = "absolute";
            canvasTemp.style.left = pileList[0].Position.X;
            canvasTemp.style.top = pileList[0].Position.Y;
            canvasTemp.className = "canvasTemp";
            deskTop.appendChild(canvasTemp);
            var ctxTemp = canvasTemp.getContext("2d");
            ctxTemp.drawImage(pileList[i].CardList[j].ShowFace ? pileList[i].CardList[j].Img : backImg, 0, 0, cardWidth, cardHeight);
            PlayAudio();
            $(canvasTemp).animate({
                "left": pileList[i].CardList[j].Position.X,
                "top": pileList[i].CardList[j].Position.Y
            }, 100, null, function ()
            {
                if (j == pileList[i].CardList.length - 1)
                {
                    i++;
                    j = 0;
                }
                else
                {
                    j++;
                }
                DealAnimation(i, j);
            });

        }

        function PlayAudio(num)
        {
            if (num == undefined)
            {
                num = 1;
            }
            if (num >= 1)
            {
                audio.currentTime = 0;
                audio.play();
            }
            num--;
            var numTemp = 0;
            var siTemp = setInterval(function ()
            {
                if (numTemp >= num)
                {
                    clearInterval(siTemp);
                }
                else
                {
                    audio.currentTime = 0;
                    audio.play();
                    numTemp++;
                }
            }, audio.duration * 1000 / 2);
        }

        function SortPileList()
        {
            pileList.sort(function (a, b)
            {
                return a.Index - b.Index;
            });
        }

        function SortCardList(_cardList)
        {
            _cardList.sort(function (a, b)
            {
                return a.IndexOfPile - b.IndexOfPile;
            });
        }

        function ShowMessage(message, autoClose)
        {
            $("#message").text(message);
            $("#result").text(score);
            $("#content").text(timeString);
            $("#messageBox").slideDown(200, null, function ()
            {
                if (autoClose)
                {
                    setTimeout(function ()
                    {
                        $("#messageBox").slideUp();
                    }, 3000);
                }
            });
        }

        function RelayOut()
        {
            IniPileListPosition();
            SetPileCardListPosition();
            IniDeskTopAndCanvas();
            DrawBack();
        }

        function GetSelectedCardList(x, y)
        {
            var cardListTemp = [];
            var cardListResultTemp = [];
            for (var i = 0; i < cardList.length; i++)
            {
                if (!cardList[i].ShowFace || cardList[i].Pile == pileList[6])
                {
                    continue;
                }
                if (cardList[i].Position.X <= x && x <= cardWidth + cardList[i].Position.X && cardList[i].Position.Y <= y && y <= cardHeight + cardList[i].Position.Y)
                {
                    cardListTemp.push(cardList[i]);
                }
            }
            if (cardListTemp.length == 0)
            {
                return cardListTemp;
            }
            SortCardList(cardListTemp);
            if (cardListTemp[0].Pile == pileList[1])
            {
                if (pileList[1].CardList[pileList[1].CardList.length - 1].Position.X > x || x > cardWidth + pileList[1].CardList[pileList[1].CardList.length - 1].Position.X || pileList[1].CardList[pileList[1].CardList.length - 1].Position.Y > y || y > cardHeight + pileList[1].CardList[pileList[1].CardList.length - 1].Position.Y)
                {
                    return cardListResultTemp;
                }
            }
            for (var i = cardListTemp[cardListTemp.length - 1].IndexOfPile; i < cardListTemp[cardListTemp.length - 1].Pile.CardList.length; i++)
            {
                cardListResultTemp.push(cardListTemp[cardListTemp.length - 1].Pile.CardList[i]);
            }
            SortCardList(cardListResultTemp);
            return cardListResultTemp;
        }

        function ActionDown(x, y)
        {
            pointDown.X = x;
            pointDown.Y = y;
            pointDownTime = new Date().getTime();
            //CountPointDownTime();
            isMouseDown = true;
            if (pileList[0].Position.X <= x && x <= cardWidth + pileList[0].Position.X && pileList[0].Position.Y <= y && y - pileList[0].Position.Y <= cardHeight)
            {
                for (var i = 0; i < pileList[1].CardList.length; i++)
                {
                    pileList[1].CardList[i].ShowFace = false;
                }
                if (pileList[0].CardList.length > 0)
                {
                    var numTemp = 0;
                    //for (var i = 0; i < 3; i++)
                    for (var i = 0; i < 1; i++) //<-- card get count
                    {
                        if (pileList[0].CardList.length > 0)
                        {
                            pileList[0].CardList[0].Pile = pileList[1];
                            pileList[0].CardList[0].IndexOfPile = pileList[1].CardList.length + i;
                            pileList[0].CardList[0].ShowFace = true;
                            pileList[0].CardList.shift();
                            numTemp++;
                        }
                    }
                    PlayAudio(numTemp);
                }
                else
                {
                    for (var i = 0; i < pileList[1].CardList.length; i++)
                    {
                        pileList[1].CardList[i].Pile = pileList[0];
                        pileList[1].CardList[i].ShowFace = false;
                    }
                    pileList[0].CardList = pileList[1].CardList;
                    pileList[1].CardList = [];
                    PlayAudio(pileList[0].CardList.length);
                }
            }
            else
            {
                var cardListTemp = GetSelectedCardList(x, y);
                if (cardListTemp.length == 0)
                {
                    return;
                }
                else if (cardListTemp.length > 0)
                {
                    PlayAudio();
                    oldPile = cardListTemp[0].Pile;
                    oldPosition = cardListTemp[0].Position;
                    if (cardListTemp[0].Pile == pileList[1])
                    {
                        if (cardListTemp[cardListTemp.length - 1] == pileList[1].CardList[pileList[1].CardList.length - 1])
                        {
                            cardListTemp[cardListTemp.length - 1].Pile = pileList[6];
                            cardListTemp[cardListTemp.length - 1].IndexOfPile = 0;
                            originalPile6OffsetX = x - cardListTemp[cardListTemp.length - 1].Position.X;
                            originalPile6OffsetY = y - cardListTemp[cardListTemp.length - 1].Position.Y;
                        }
                    }
                    else if (cardListTemp[0].Pile.Index >= 2 && cardListTemp[0].Pile.Index <= 5)
                    {
                        cardListTemp[cardListTemp.length - 1].Pile = pileList[6];
                        cardListTemp[cardListTemp.length - 1].IndexOfPile = 0;
                        originalPile6OffsetX = x - cardListTemp[cardListTemp.length - 1].Position.X;
                        originalPile6OffsetY = y - cardListTemp[cardListTemp.length - 1].Position.Y;
                    }
                    else
                    {
                        for (var i = 0; i < cardListTemp.length; i++)
                        {
                            cardListTemp[i].Pile = pileList[6];
                            cardListTemp[i].IndexOfPile = i;
                            originalPile6OffsetX = x - cardListTemp[0].Position.X;
                            originalPile6OffsetY = y - cardListTemp[0].Position.Y;
                        }
                    }
                    pileList[6].Position = new Position(x - originalPile6OffsetX, y - originalPile6OffsetY);
                    canvasFont.style.left = pileList[6].Position.X;
                    canvasFont.style.top = pileList[6].Position.Y;
                }
            }
            SetPileCardList();
            SetPileCardListPosition();
            DrawBack();
            DrawFont();
        }

        function ActionMove(x, y)
        {
            clearInterval(pointDownInterval);
            if (isMouseDown && pileList[6].CardList.length > 0)
            {
                pileList[6].Position = new Position(x - originalPile6OffsetX, y - originalPile6OffsetY);
                canvasFont.style.left = pileList[6].Position.X;
                canvasFont.style.top = pileList[6].Position.Y;
            }
        }

        function ActionUp(x, y)
        {
            isMouseDown = false;
            clearInterval(pointDownInterval);
            canvasFont.style.display = "none";
            var targetPile;
            if (pileList[6].CardList.length == 0)
            {
                return;
            }
            if (Math.abs(x - pointDown.X) < 5 && Math.abs(y - pointDown.Y) < 5)
            {
                ActionClick();
                return;
            }
            var cardListTemp = GetSelectedCardList(x, y);
            if (cardListTemp.length == 0)
            {
                var pileTemp = GetEmptyPile(x, y);
                if (pileTemp != null)
                {
                    if (pileTemp.Index >= 2 && pileTemp.Index <= 5)
                    {
                        if (pileList[6].CardList.length == 1 && pileList[6].CardList[0].Index == 0)
                        {
                            targetPile = pileTemp;
                        }
                    }
                    else if (pileTemp.Index >= 7 && pileTemp.Index <= 13)
                    {
                        if (pileList[6].CardList[0].Index == 12)
                        {
                            targetPile = pileTemp;
                        }
                    }
                }
            }
            else
            {
                if (cardListTemp[cardListTemp.length - 1].Pile.Index >= 2 && cardListTemp[cardListTemp.length - 1].Pile.Index <= 5)
                {
                    if (cardListTemp.length == 1 && cardListTemp[0].Type == pileList[6].CardList[0].Type && pileList[6].CardList[0].Index - cardListTemp[0].Index == 1)
                    {
                        targetPile = cardListTemp[0].Pile;
                    }
                }
                else if (cardListTemp[cardListTemp.length - 1].Pile.Index >= 7 && cardListTemp[cardListTemp.length - 1].Pile.Index <= 13)
                {
                    if (cardListTemp[cardListTemp.length - 1].Color != pileList[6].CardList[0].Color && cardListTemp[cardListTemp.length - 1].Index - pileList[6].CardList[0].Index == 1)
                    {
                        targetPile = cardListTemp[cardListTemp.length - 1].Pile;
                    }
                }
            }
            if (!targetPile)
            {
                targetPile = oldPile;
            }
            MovePile6(targetPile);

        }

        function ActionClick()
        {
            var targetPile;
            var cardLast = pileList[6].CardList[pileList[6].CardList.length - 1];
            var card0 = pileList[6].CardList[0];
            for (var i = 2; i <= 5; i++)
            {
                if (targetPile)
                {
                    break;
                }
                if (i == oldPile.Index)
                {
                    continue;
                }
                if (pileList[i].CardList.length == 0)
                {
                    if (cardLast.IndexOfPile == 0 && cardLast.Index == 0)
                    {
                        targetPile = pileList[i];
                    }
                }
                else if (cardLast.IndexOfPile == 0 && cardLast.Index - pileList[i].CardList[pileList[i].CardList.length - 1].Index == 1 && cardLast.Type == pileList[i].CardList[pileList[i].CardList.length - 1].Type)
                {
                    targetPile = pileList[i];
                }
            }
            for (var i = 7; i <= 13; i++)
            {
                if (targetPile)
                {
                    break;
                }
                if (i == oldPile.Index)
                {
                    continue;
                }
                if (pileList[i].CardList.length == 0)
                {
                    if (card0.Index == 12)
                    {
                        targetPile = pileList[i];
                    }
                }
                else if (pileList[i].CardList[pileList[i].CardList.length - 1].Index - card0.Index == 1 && card0.Color != pileList[i].CardList[pileList[i].CardList.length - 1].Color)
                {
                    targetPile = pileList[i];
                }
            }
            if (!targetPile)
            {
                targetPile = oldPile;
            }
            MovePile6(targetPile);
        }

        function GetEmptyPile(x, y)
        {
            for (var i = 2; i <= 5; i++)
            {
                if (pileList[i].CardList.length == 0)
                {
                    if (pileList[i].Position.X <= x && x <= pileList[i].Position.X + cardWidth && pileList[i].Position.Y <= y && y <= pileList[i].Position.Y + cardHeight)
                    {
                        return pileList[i];
                    }
                }
            }
            for (var i = 7; i <= 13; i++)
            {
                if (pileList[i].CardList.length == 0)
                {
                    if (pileList[i].Position.X <= x && x <= pileList[i].Position.X + cardWidth && pileList[i].Position.Y <= y && y <= $(window).height())
                    {
                        return pileList[i];
                    }
                }
            }
            return null;
        }

        function MovePile6(targetPile)
        {
            if (!targetPile)
            {
                return;
            }
            isPlayingAnimation = true;
            canvasFont.style.display = "block";
            var targetX;
            var targetY;
            if (targetPile.Index == 1)
            {
                targetX = targetPile.Position.X;
                for (var i = 0; i < targetPile.CardList.length; i++)
                {
                    if (targetPile.CardList[i].ShowFace)
                    {
                        targetX += targetPile.OffsetX;
                    }
                }
                targetY = targetPile.Position.Y;
            }
            else if (targetPile.Index >= 2 && targetPile.Index <= 5)
            {
                targetX = targetPile.Position.X;
                targetY = targetPile.Position.Y;
            }
            else if (targetPile.Index >= 7 && targetPile.Index <= 13)
            {
                targetX = targetPile.Position.X;
                targetY = targetPile.Position.Y + targetPile.CardList.length * targetPile.OffsetY;
            }
            var distance = Math.sqrt(Math.pow((pileList[6].Position.X - targetX), 2) + Math.pow((pileList[6].Position.Y - targetY), 2));
            var duration = distance / 2;
            $(canvasFont).animate({
                "left": targetX,
                "top": targetY
            }, duration, "easeOutElastic", function ()
            {
                isPlayingAnimation = false;
                canvasFont.style.display = "none";
                for (var i = 0; i < pileList[6].CardList.length; i++)
                {
                    pileList[6].CardList[i].Pile = targetPile;
                    pileList[6].CardList[i].IndexOfPile = targetPile.CardList.length + i;
                }
                SetPileCardList();
                SetPileCardListPosition();
                for (var i = 7; i < 14; i++)
                {
                    if (pileList[i].CardList.length > 0)
                    {
                        pileList[i].CardList[pileList[i].CardList.length - 1].ShowFace = true;
                    }
                }
                DrawBack();
                if (targetPile.Index >= 2 && targetPile.Index <= 5)
                {
                    CountScore();
                }
                if (IsGameFinished())
                {
                    FinishGame();
                }
            });
        }

        function GetShowFaceCardCount()
        {
            var showFaceCardCount = 0;
            for (var i = 0; i < cardList.length; i++)
            {
                if (cardList[i].ShowFace)
                {
                    showFaceCardCount++;
                }
            }
            return showFaceCardCount;
        }

        function IsGameFinished()
        {
            var showFaceCardCount = GetShowFaceCardCount();
            var count = 0;
            if (showFaceCardCount >= cardList.length)
            {
                for (var i = 0; i < cardList.length; i++){
                    if (cardList[i].Pile.Index >= 2 && cardList[i].Pile.Index <= 5){
                            count++;
                    }
                }

                if(count >= 52){
                    return true;
                }
            }
            return false;
        }

        function CountScore()
        {
            if (isGameFinished)
            {
                return;
            }
            var putCardsCount = 0;

            for (var i = 0; i < cardList.length; i++)
            {
                if (cardList[i].Pile.Index >= 2 && cardList[i].Pile.Index <= 5)
                {
                    putCardsCount++;
                }
            }
            console.log("------------------");

            score = putCardsCount * 100;
            $("#score").html(score);
        }

        function CountTime()
        {
            if (!gameStartTime)
            {
                gameStartTime = new Date().getTime();
            }
            gameInterval = setInterval(function ()
            {
                //var timeNow = new Date().getTime();
                //var timeSpan = new Date(timeNow - gameStartTime);
                //var hh = timeSpan.getHours() - 8;
                //var mm = timeSpan.getMinutes();
                //var ss = timeSpan.getSeconds();
                ss++;
                if(ss > 59){
                    mm++;
                    ss = 0;
                }

                if(mm > 59){
                    hh++;
                    mm = 0;
                }

                if(hh > 99){
                    hh = 0;
                }

                var h = '';
                var m = '';
                var s = '';

                h = hh < 10 ? '0' + hh : hh;
                m = mm < 10 ? '0' + mm : mm;
                s = ss < 10 ? '0' + ss : ss;
                timeString = h + ":" + m + ":" + s;
                $("#timer").html(timeString);
            }, 1000);
        }

        function FinishGame()
        {
            clearInterval(gameInterval);
            isGameFinished = true;
            ShowMessage("Congratulations!");
        }

        function WinAnimation(i)
        {
            if (i > 13)
            {
                return;
            }
            if (pileList[i].CardList.length == 0)
            {
                WinAnimation(i + 1);
                return;
            }
            isPlayingAnimation = true;
            var j = pileList[i].CardList.length - 1;
            var img = pileList[i].CardList[j].ShowFace ? pileList[i].CardList[j].Img : backImg;
            var canvasTemp = document.createElement("canvas");
            canvasTemp.width = cardWidth;
            canvasTemp.height = cardHeight;
            canvasTemp.style.position = "absolute";
            canvasTemp.style.left = pileList[i].CardList[j].Position.X;
            canvasTemp.style.top = pileList[i].CardList[j].Position.Y;
            canvasTemp.className = "canvasTemp";
            canvasTemp.style.zIndex = "4";
            deskTop.appendChild(canvasTemp);
            var ctxTemp = canvasTemp.getContext("2d");
            ctxTemp.drawImage(img, 0, 0, cardWidth, cardHeight);
            pileList[i].CardList[j].Pile = null;
            SetPileCardList();
            SetPileCardListPosition();
            DrawBack();
            PlayAudio();
            $(canvasTemp).animate({
                "left": canvasTemp.style.left,
                "top": canvasBack.height - cardHeight
            }, 1000, "easeOutBounce", function ()
            {
                if (j == 0)
                {
                    i++;
                }

                if(isGameFinished == false){   //new game animation stop
                    return;
                }
                WinAnimation(i);
            });
        }

        function ShowCmdBox()
        {
            /*
            cmd.value = "";
            $("#cmdBox").show(function ()
            {
                cmd.focus();
            });
            */
        }

        function HideCmdBox()
        {
            //$("#cmdBox").hide(function () { });
        }

        function CountPointDownTime()
        {
            /*
            pointDownInterval = setInterval(function ()
            {
                var timeNow = new Date().getTime();
                if (timeNow - pointDownTime >= 1000)
                {
                    clearInterval(pointDownInterval);
                    ShowCmdBox();
                }
            }, 50);
            */
        }

        function BindEvent()
        {
            //if(clickAble){

                $(window).bind("mousedown touchstart", function (e)
                {
                    e.preventDefault();
                    var x;
                    var y;
                    if (e.type == "touchstart")
                    {
                        x = e.originalEvent.changedTouches[0].clientX;
                        y = e.originalEvent.changedTouches[0].clientY;
                    }
                    else
                    {
                        x = e.clientX;
                        y = e.clientY;
                    }
                    if (isPlayingAnimation)
                    {
                        return;
                    }
                    ActionDown(x, y - 50);
                });

                $(window).bind("mousemove touchmove", function (e)
                {
                    e.preventDefault();
                    var x;
                    var y;
                    if (e.type == "touchmove")
                    {
                        x = e.originalEvent.changedTouches[0].clientX;
                        y = e.originalEvent.changedTouches[0].clientY;
                    }
                    else
                    {
                        x = e.clientX;
                        y = e.clientY;
                    }
                    if (isPlayingAnimation)
                    {
                        return;
                    }
                    ActionMove(x, y - 50);
                });

                $(window).bind("mouseup touchend", function (e)
                {
                    e.preventDefault();
                    var x;
                    var y;
                    if (e.type == "touchend")
                    {
                        x = e.originalEvent.changedTouches[0].clientX;
                        y = e.originalEvent.changedTouches[0].clientY;
                    }
                    else
                    {
                        x = e.clientX;
                        y = e.clientY;
                    }
                    if (isPlayingAnimation)
                    {
                        return;
                    }
                    ActionUp(x, y - 50);
                });

                $("#messageBoxConfirm").bind("mouseup touchend", function ()
                {
                    $("#messageBox").slideUp(200, null, function ()
                    {
                        if (isGameFinished)
                        {
                            WinAnimation(0);
                        }
                    });
                });

            //}

            /*
            $(window).keydown(function (e)
            {
                if (e.keyCode == 13)
                {
                    e.preventDefault();
                    if ($("#cmdBox").css("display") == "none")
                    {
                        ShowCmdBox();
                    }
                    else
                    {
                        try
                        {
                            eval(cmd.value);
                        }
                        catch (e)
                        {

                        }
                        HideCmdBox();
                    }
                }
            });
            */
        }

        function timetoggle(){
                if($("#curtain").css("display") == "none"){
                     pause();

                }else{
                    resume();
                }
        }

        function pause(){
            if(!startAnimation){
                isPlayingAnimation = true;  //click block
                clearInterval(gameInterval);  //timer pause
                $("#stopButton").hide();
                $("#newButton").hide();
                $("#curtain").show();
            }
            //s.style.display="";
        }

        function resume(){
            isPlayingAnimation = false;   //click start
            CountTime(); //timer resume
            $("#stopButton").show();
            $("#newButton").show();
            $("#curtain").hide();
            //s.style.display="none";
        }

        function start(){

            hh = 0;
            mm = 0;
            ss = 0;
            timeString ='';

            cardList = [];
            pileList = [];
            loadedImgCount = 0;
            loadImgTimeout = 5000;
            cardWidth = null;
            cardHeight= null;
            originalCardWidth = null;
            originalCardHeight = null;
            pileGapX = null;
            pileGapY = null;
            pileGapScaleX = 0.2;
            pileGapScaleY = 0.2;
            oldPile = null;
            oldPosition = null;
            isMenuShown = null;
            originalPile6OffsetX = null;
            originalPile6OffsetY = null;
            //cardColors = ["Black", "Heart", "Club", "Diamond"];
            //cardIndexs = ["_A", "_2", "_3", "_4", "_5", "_6", "_7", "_8", "_9", "_10", "_J", "_Q", "_K"];
            canvasBack = document.getElementById("canvasBack");
            canvasFont = document.getElementById("canvasFont");
            ctxBack = canvasBack.getContext("2d");
            ctxFont = canvasFont.getContext("2d");
            isMouseDown = false;
            pointDown = {};
            pointDownTime = null;
            pointDownInterval = null;
            isPlayingAnimation = false;
            gameStartTime = 0; 
            //gameInterval = null;
            isGameFinished = false;

            startAnimation = true;

            score=0;

            //clickAble = true; // click start


            var t1 = new Date().getTime();
            LoadCardImage();
            var si = setInterval(function ()
            {
                if (loadedImgCount == 53)
                {
                    IniGame();
                    clearInterval(si);
                }
                var t2 = new Date().getTime();
                if (t2 - t1 > loadImgTimeout && loadedImgCount < 53)
                {
                    //ShowMessage("Load resource timeout");
                    clearInterval(si);
                }
            }, 50);


        }

        function reset(){

            if(!startAnimation){
                clearInterval(gameInterval);
                $("#timer").html('0' +0 + ":" + '0' +0 + ":" + '0' +0);
                $("#score").html(0);

                start();
            }
        }

        function startBtn(){

            $("#menu").hide();
            $("#stopButton").show();
            $("#newButton").show();
            $("#footer").show();

            clearInterval(gameInterval);
            $("#timer").html('0' +0 + ":" + '0' +0 + ":" + '0' +0);
            $("#score").html(0);

            start();

        }

        $(document).ready(function ()
        {
            /*
            var t1 = new Date().getTime();
            LoadCardImage();
            var si = setInterval(function ()
            {
                if (loadedImgCount == 53)
                {
                    IniGame();
                    clearInterval(si);
                }
                var t2 = new Date().getTime();
                if (t2 - t1 > loadImgTimeout && loadedImgCount < 53)
                {
                    ShowMessage("Load resource timeout");
                    clearInterval(si);
                }
            }, 50);
            */

            //start();


            $(window).resize(function () { RelayOut(); });
            BindEvent();
        });