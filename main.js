/*
    멍멍이 나만없어 : 강아지 사진 브라우저
    안유빈@2018

    =====================================================================
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

/*
    Global variables
    =================================================================================
*/
var dogBreedList = []; // List of breeds
var loadingThumbnails = ["sprites/thumbLoad1.png", "sprites/thumbLoad2.png", "sprites/thumbLoad3.png"]; // Random list of loading placeholder images
var lists = []; // List of entries
var msgModal = document.querySelector("#msg.modal");
var picModal = document.querySelector("#pic.modal");
var isMsgOn = false;

// picture modal
var picqueue = [""]; // picture list
var picidx = 0; // current picture idx
var picBreedId = "beagle"; // current viewing breed id

/*
    Function to translate the breeds text to fancier, Translated version.
    =================================================================================
*/
function translateBreed (text)
{
    if (text in breedTranslateKR && breedTranslateKR[text] != "")
        text = breedTranslateKR[text];
    else
        console.log("ERROR WHILE TRANSLATING - TRANSLATE DOESN'T EXIST : " + text);

    return text;
}

/*
    Function to fetch the DOG API
    ---
    url - The url to send sequest
    callback - Callback function that will be executed after done loading. (Will pass the respond's content!)
    pass - The variable that will be passed to the callback function
    =================================================================================
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
                // console.log("DOG API SUCCESS");
                callback(responseJson.message, pass);
            }
            else
            {
                console.log("DOG API ERROR D:");
                callback(null);
            }
        }
    };
    request.onerror = function()
    {
        console.log("REQUEST ERROR : " + toString(this.statusText));
        callback(null);
    };


    request.open("GET", url, true);
    request.send(null);
}

/*
    Dog API helpers
    =================================================================================
*/
function fetchAllDogOld ()
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

        var bodyNode = document.getElementById("main");
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

            // translate
            listDescNode.innerHTML = translateBreed(breedStr);

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

// Fetch button handler - Init
function listAllInit ()
{
    deleteAll();
    fetchAllBreeds(listAllDone);
}

// Fetch button handler - Done
function listAllDone ()
{
    // Update list
    var bodyNode = document.getElementById("main");
    var breedListNode = bodyNode.querySelector(".breed-list > #list");
    
    /*
    // Clear list
    var breedChilds = breedListNode.childNodes;
    while (breedListNode.childNodes.length > 0)
        breedListNode.removeChild(breedChilds[0]);

    // Add list
    dogBreedList.forEach(breed =>
        {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(breed + " => KO[" + translateBreed(breed) + "]"));

            breedListNode.appendChild(li);
        });
    */

    // Build queue
    var breedQueue = [];
    var head = 0, ass = 0;
    dogBreedList.forEach(breed =>
        {
            breedQueue[ass++] =  [breed, translateBreed(breed)];
        });

    // Dequeue and add list in some intervals
    var dequeueLoop = setInterval(function ()
    {
        // If there's no such breeds left to dequeue
        if (head >= ass)
        {
            clearInterval(dequeueLoop);
            return;
        }

        // If not, Keep dequeueing and adding list
        var breedStr = breedQueue[head++]; // Dequeue - get value, head++
        var listElem = addList();

        // Set list's contents
        listElem.querySelector("#desc").innerHTML = breedStr[1]; // Translate & Set list title
        dogFetch("https://dog.ceo/api/breed/" + breedStr[0] + "/images/random", function (thumburl)
        {
            // Thumbnail; Fetch & Uses callbackfunction to set it!
            updateThumbnail(listElem.querySelector("#thumbnail"), thumburl);
            // updateThumbnail(listElem.querySelector("#thumbnail"), "E.jpg");
        });

        // Set click event
        setListClickCallback(listElem, function ()
        {
            resetPic(breedStr[0]);
            showPic(breedStr[1]);
        });
        
        // Debug : Only do it once for testing
        // console.log(breedQueue);
        // clearInterval(dequeueLoop);
    }, 42); // 42 kek
}

// Fetches all dogs breed and stores in breedList
function fetchAllBreeds (callback)
{
    dogFetch("https://dog.ceo/api/breeds/list/all", function (allbreeds, error)
    {
        // Clear breeds dict & fill it w/ breeds
        if (allbreeds)
        {
            dogBreedList = [];
    
            for (breed in allbreeds)
            {
                dogBreedList.push(breed);
            }
    
            if (callback)
                callback();
        }
        else
        {
            showModal("에러", "견종을 받아오는 중 에러가 났어요.<br>인터넷 접속을 확인해 주세요.");
        }
    });
}

/*
    Adds random list and updates its picture to a random dog image
    =================================================================================
*/
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

/*
    Adds list
    =================================================================================
*/
function addList ()
{
    // Default breed text
    var dogFirst = new Array("시베리안 ", "웰시 ", "단단한 ", "댕댕이 ", "진돗", "개같은 ", "골든 ", "이 페이지는 유빈이껍니다 만지지마 퉤퉷퉤");
    var dogLast = new Array("개", "허스키", "코기", "치와와", "포메나리안", "댕댕이", "리트리버", "홍길동", "철수", "이 페이지는 유빈이껍니다 만지지마 퉤퉷퉤");
    
    var list = document.querySelector("#main > .list");
    
    // List base
    var listentry = document.createElement("li");
    listentry.className = "list-entry";

    // components of entry
    var entryDesc = document.createElement("p");
    var entryImg = document.createElement("div");
    var entryDescContainer = document.createElement("div");

    // Set desc to random gibberish
    var randomX = Math.floor(Math.random() * dogFirst.length);
    var randomY = Math.floor(Math.random() * dogLast.length);
    entryDesc.appendChild(document.createTextNode(dogFirst[randomX] + dogLast[randomY]));
    entryDesc.id = "desc";
    entryDescContainer.id = "container";
    entryDescContainer.appendChild(entryDesc);

    // Set thumbnial to random doggo :D
    entryImg.id = "thumbnail";

    var randomIdx = Math.floor(Math.random() * loadingThumbnails.length);
    entryImg.style.backgroundImage = "url("+loadingThumbnails[randomIdx]+")";

    // Add node
    listentry.appendChild(entryImg);
    listentry.appendChild(entryDescContainer);

    list.appendChild(listentry);

    // Return list
    return listentry;
}

function setListClickCallback (listelem, callback)
{
    var entryImg = listelem.querySelector("#thumbnail");
    entryImg.onclick = callback;
}

function updateThumbnail (thumbElem, url)
{
    var thumbImg = new Image();
    thumbImg.src = url;
    thumbImg.onload = function () { thumbElem.style.backgroundImage = "url(" + url + ")"; };
    thumbImg.onerror = function () { thumbElem.style.backgroundImage = "url(" + url + ")"; };
}

/*
    Function to check the elements of image queue's type and update the gallery pic
    ===============================================================================
*/
function updateGalleryPic (idx)
{
    var picElem = document.querySelector("#pic.modal > #content > #wrapper > #pic");
    
    var pic = picqueue[idx];
    
    if ((typeof pic) == "object") // Img
    {
        if (pic.complete)
        {
            picElem.src = pic.src;
        }
        else
        {
            picElem.src = "sprites/picTransparent.png";
            pic.onload = function ()
            {
                picElem.src = this.src;
            }
        }
    }
    else // Internal File
    {
        picElem.src = pic;
    }
}

/*
    Function to directly change gallery picture
    ===========================================
*/
function setGalleryPic (url)
{
    var picElem = document.querySelector("#pic.modal > #content > #wrapper > #pic");
    
    picElem.src = url;
    picElem.style.display = "block";
}

function deleteAll ()
{
    var listList = document.getElementsByClassName("list-entry"); // AEUHHH?

    while (listList.length >= 1)
    {
        var currentEntry = listList.item(0);
        currentEntry.parentElement.removeChild(currentEntry);
    }
}

/*
    =============================================================================================================
    
    General website logic

    =============================================================================================================
*/

function pageReady ()
{
    msgModal = document.querySelector("#msg.modal");
    picModal = document.querySelector("#pic.modal");
    
    var modalOKelem = document.querySelector("#msg > #content > #close");
    console.log(modalOKelem);
    modalOKelem.onclick = function ()
    {
        hideModal();
    }

    var imgCloseelem = document.querySelector("#pic > #content > #close");
    console.log(imgCloseelem);
    imgCloseelem.onclick = function ()
    {
        hidePic();
    }

    // Fetch breeds
    fetchAllBreeds(listAllDone);
    resetPic("beagle");

    console.log("READY!");
}

function showModal (title, content)
{
    if (!msgModal)
        msgModal = document.querySelector("#msg.modal");

    msgModal.querySelector("#content > #title").innerHTML = title;
    msgModal.querySelector("#content > #desc").innerHTML = content;
    msgModal.style.display = "block";

    isMsgOn = true;
}

function hideModal ()
{
    msgModal.style.display = "none";
    isMsgOn = false;
}

/*
    Picture modal related shit
    ============================================
*/
function showPic (title)
{
    if (!picModal)
        picModal = document.querySelector("#pic.modal");

    picModal.style.display = "block";

    if (title)
        picModal.querySelector("#content > #title").textContent = title;
}

function hidePic ()
{
    if (!picModal)
        picModal = document.querySelector("#pic.modal");
        
    picModal.style.display = "none";
}

/*
    Function to reset the queue & load new breed
    =======================================================
*/
function resetPic (breed)
{
    // Show loading image
    setGalleryPic("sprites/picTransparent.png");
    // setGalleryPic(null);

    // clear pic queue
    picqueue = [];
    picidx = 0;

    // Update pic queue
    picBreedId = breed;
    addPic();
    addPic();
}

/*
    Function to load & add a picture of current breed to the queue
    =======================================================
*/
function addPic (callback)
{
    // Preload
    var img = new Image();
    img.src = "sprites/picTransparent.png";
    picqueue.push(img);

    dogFetch("https://dog.ceo/api/breed/" + picBreedId + "/images/random", function (url)
    {    
        img.src = url;
        updateGalleryPic(picidx); // Juuust in case of the unloaded image loading after we updated into it

        if (callback)
            callback (url);
    });
}

/*
    Function to handle the picture controls
    =======================================================
*/
function nextPic ()
{
    // Increment idx
    picidx++;
    
    // Add picture if somehow outta-bounds error happeened
    if (picidx >= picqueue.length)
    {
        // console.log("OVERFLOW : LOADIN'!");
        addPic();
    }
    else // change pic
    {
        // console.log("NEXT");
        updateGalleryPic(picidx);
    }
    
    if (picidx >= picqueue.length - 1) // Prepare picture
        addPic();
}

function prevPic ()
{
    // Increment idx
    picidx--;
    if (picidx < 0) picidx = 0;
    // TODO: Disable previous button

    // Add picture if overflow
    if (picidx >= picqueue.length - 1)
        addPic();

    // change pic
    updateGalleryPic(picidx);
}

