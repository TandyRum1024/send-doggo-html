/*
    DOG API : 
    Every request looks something like this (JSON) :
    {
        "status": "success" / "fail?",
        "message": "your stuff"
    }

    https://dog.ceo/api/breeds/list/all - List all breeds, Contains dict of breeds. May have list as subreeds
    https://dog.ceo/api/breeds/image/random - gets random picture. Returns URL
    https://dog.ceo/api/breed/<BREED>/images/random - Gets random image from breed. Put something like "hound"
    https://dog.ceo/api/breed/<BREED>/list - Gets sub-breed
*/

function dogFetch (url, callback, pass)
{
    var request = new XMLHttpRequest();

    // set callback functor
    // This bad boy gets called everytime the state changes; Good for checking if the request is done or not.
    request.onreadystatechange = function ()
    {
        /*
            0 - Unsent : Client was just created, open() not available.. yet
            1 - Opened : open() has called
            2 - Headers received : Were receiving headers woo
            3 - Loading : responseText contains weird garbage junk of unfinished stuff
            4 - All Done : Yes you may use responseText.
        */
        if (this.readyState == 4 && this.status == 200)
        {
            var responseJson = JSON.parse(this.responseText);

            if (responseJson.status == "success")
            {
                console.log("DOG API SUCCESS");
                callback(responseJson.message, pass);
            }
            else
            {
                console.log("DOG API ERROR D:");
                callback(null);
            }
        }
    }

    request.open("GET", url, true);
    request.send(null);
}

function fetchAllDog ()
{
    // Fetch blyat
    dogFetch("https://dog.ceo/api/breeds/list/all", function (breeds)
    {
        var breedList = new Array();
        var idx = 0;

        console.log(breeds);

        // Build dog breed list
        for (var key in breeds)
        {
            breedList[idx++] = key;
        }

        var bodyNode = document.getElementById("body");
        var breedListNode = bodyNode.querySelector(".breed-list > #list");
        var breedChildNodes = breedListNode.childNodes;

        // Clear list first
        console.log(breedChildNodes);
        while (breedChildNodes.length >= 1)
        {
            var currentEntry = breedChildNodes.item(0);
            breedListNode.removeChild(currentEntry);
        }
        deleteAll();

        // Build list
        for (var i=0; i<breedList.length; i++)
        {
            var breedStr = breedList[i];
            var listNode = document.createElement( "li" );
            var textNode = document.createTextNode( breedStr );

            listNode.appendChild(textNode);
            breedListNode.appendChild(listNode);
            // console.log("BREED " + i + ": " + breedList[i]);

            // Make list
            var listElem = addList();
            var listDescNode = listElem.querySelector("#desc");
            listDescNode.textContent = breedStr;

            dogFetch("https://dog.ceo/api/breed/" + breedStr + "/images/random",
            function(url, listElem)
            {
                // Apply fetched image
                var dogPicture;

                if (!url)
                    dogPicture = "url('DOG_DANCE.png')";
                else
                    dogPicture = url;

                if (listElem)
                    listElem.childNodes.item("thumbnail").style.backgroundImage = "url('" + dogPicture + "')";
            }, listElem);
        }
    });
}

function addRandomListMaster ()
{
    // A] Make list first, Update image later? maybe I can pass the image div to the callback function...
    var listElem = addList();

    // Fetch, Dog!
    dogFetch("https://dog.ceo/api/breeds/image/random", function (url, listElem)
                                                        {
                                                            var dogPicture;

                                                            if (!url)
                                                            {
                                                                console.log("LIST EDIT ERROR!");
                                                                console.log("PLZFIX - USING DEFAULT DOG!");
                                                                dogPicture = "url('DOG_DANCE.png')";
                                                            }
                                                            else
                                                                dogPicture = url;

                                                            if (listElem)
                                                                listElem.childNodes.item("thumbnail").style.backgroundImage = "url('" + dogPicture + "')";
                                                        }
                                                        , listElem);
}

function addList ()
{
    var dogFirst = new Array("시베리안 ", "웰시 ", "단단한 ", "댕댕이 ", "진돗", "개같은 ", "골든 ");
    var dogLast = new Array("개", "허스키", "코기", "치와와", "포메나리안", "댕댕이", "리트리버", "홍길동", "철수");
    
    var bodyNode = document.getElementById("body");
    
    // List base
    var listElem = document.createElement("div");
    listElem.className = "list";

    // Description of list entry
    var descElem = document.createElement("span");

    var randomX = Math.floor(Math.random() * dogFirst.length);
    var randomY = Math.floor(Math.random() * dogLast.length);
    descElem.appendChild(document.createTextNode(dogFirst[randomX] + dogLast[randomY]));
    descElem.id = "desc";

    // Thumbnail of list entry
    var thumbElem = document.createElement("div");
    thumbElem.id = "thumbnail";
    // thumbElem.style.backgroundImage = "url("+thumburl+")";

    // Add node
    listElem.appendChild(thumbElem);
    listElem.appendChild(descElem);

    bodyNode.appendChild(listElem);

    // Return list
    return listElem;
}

function updateThumbnail (thumbElem, url)
{
    thumbElem.style.backgroundImage = "url(" + url + ")";
}

function deleteAll ()
{
    var listList = document.getElementsByClassName("list"); // AEUHHH?

    while (listList.length >= 1)
    {
        var currentEntry = listList.item(0);
        currentEntry.parentElement.removeChild(currentEntry);
    }
}