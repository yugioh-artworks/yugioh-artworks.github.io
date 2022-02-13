(()=>
{

const _numerically = ((a,b) =>
{
    const numA = parseInt(a);
    const numB = parseInt(b);
    const aIsInt = (isFinite(numA) && ((''+numA) === (''+a)));
    const bIsInt = (isFinite(numB) && ((''+numB) === (''+b)));
    if (aIsInt !== bIsInt)
        return aIsInt ? -1 : 1;
    if (aIsInt)
        return numA-numB;
    return ((''+a) < (''+b)) ? -1 : 1;
});

let manifest = null;
let selectedCardId = null;
let selectedCardName = null;
let selectedArtId = null;
let selectedLocale = null;

const redrawControlled = (() =>
{
    if (!manifest || !selectedCardId)
    {
        document.body.classList.remove('show-controlled','show-message');
        if (selectedCardId)
        {
            document.body.classList.add('show-message');
            if (manifest !== null)
                document.getElementById('message').innerText = 'Failed to load manifest.json.';
        }
        return;
    }
    
    let artworkData = null;
    let code = ("const manifest = await (await fetch('https://artworks.ygorganization.com/manifest.json')).json();\nconst cardData = manifest.cards["+selectedCardId+"]; // "+selectedCardName+"\nconsole.log(cardData);\n\n");
    const cardData = manifest.cards[selectedCardId];
    if (selectedArtId !== null)
    {
        code += ("const artId = "+selectedArtId+";\nconst artworkData = manifest.cards[cardId][artId];\n\n");
        artworkData = cardData[selectedArtId];
    }
    else
    {
        code += ("const artId = Object.keys(cardData)[0];\nconst artworkData = cardData[artId];\n\n");
        artworkData = cardData[Object.keys(cardData)[0]];
    }
    
    let artworkPath = null;
    if (selectedLocale === null)
    {
        code += ("const artworkPath = artworkData.bestArt;\n");
        artworkPath = artworkData.bestArt;
    }
    else if (selectedLocale === 'tcg')
    {
        code += ("const artworkPath = (artworkData.bestTCG || artworkData.bestArt);\n");
        artworkPath = (artworkData.bestTCG || artworkData.bestArt);
    }
    else if (selectedLocale === 'ocg')
    {
        code += ("const artworkPath = (artworkData.bestOCG || artworkData.bestArt);\n");
        artworkPath = (artworkData.bestOCG || artworkData.bestArt);
    }
    else
    {
        code += ("const localeData = artworkData.idx."+selectedLocale+";\nconst artworkPath = (localeData ? localeData[0].path : artworkData.bestArt);\n");
        const localeData = artworkData.idx[selectedLocale];
        artworkPath = (localeData ? localeData[0].path : artworkData.bestArt);
    }
    
    code += "const artworkURL = new URL(artworkPath, 'https://artworks.ygorganization.com/');\ndocument.getElementById('artwork').src = artworkURL.href;";
    document.getElementById('artwork').src = artworkPath;
    
    const codeElm = document.getElementById('code-block');
    codeElm.textContent = code;
    hljs.highlightElement(codeElm);
    
    const jsonDummy = {}
    for (const [artId, artData] of Object.entries(manifest.cards[selectedCardId]))
    {
        if (artData === artworkData)
        {
            const artJsonDummy = { bestArt: artworkData.bestArt };
            if (selectedLocale === 'tcg')
                artJsonDummy.bestTCG = artworkData.bestTCG || 'UNDEFINED REPLACE';
            else if (selectedLocale === 'ocg')
                artJsonDummy.bestOCG = artworkData.bestOCG || 'UNDEFINED REPLACE';
            else if (selectedLocale)
                artJsonDummy.idx = { [selectedLocale]: (artworkData.idx[selectedLocale] || 'UNDEFINED REPLACE') };
            jsonDummy[artId] = artJsonDummy;
        }
        else
            jsonDummy[artId] = 'OMIT OBJ REPLACE';
    }
    const jsonElm = document.getElementById('json-block');
    jsonElm.textContent = (
        '{ /* manifest.cards['+selectedCardId+'] */'+
        JSON.stringify(jsonDummy,null,2).substr(1)
        .replaceAll('"OMIT OBJ REPLACE"','{ /* … data omitted … */ }')
        .replaceAll('"UNDEFINED REPLACE"','undefined')
        .replaceAll('\n          "',' "')
        .replaceAll('\n        }',' }')
    );
    hljs.highlightElement(jsonElm);
    
    const artworkSelector = document.getElementById('select-artid');
    const availableArtworkIds = ['__null'].concat(Object.keys(cardData).sort(_numerically));
    let idxExisting = 0, idxAvailable = 0;
    while ((idxExisting < artworkSelector.children.length) || (idxAvailable < availableArtworkIds.length))
    {
        const existingElm = artworkSelector.children[idxExisting];
        const existingValue = existingElm ? existingElm.value : null;
        const availableValue = availableArtworkIds[idxAvailable];
        if (existingValue === availableValue)
        {
            ++idxExisting;
            ++idxAvailable;
            continue;
        }
        if (existingValue && _numerically(existingValue, availableValue) < 0) /* existing comes before available, need to remove existing */
        {
            artworkSelector.removeChild(existingElm);
            /* no need to adjust index */
        }
        else /* existing comes after available, need to insert available */
        {
            const newChild = document.createElement('option');
            newChild.innerText = ('Artwork '+availableValue);
            newChild.value = (''+availableValue);
            artworkSelector.insertBefore(newChild, existingElm);
            ++idxExisting; /* new child insertion shifts index of existingElm */
            ++idxAvailable;
        }
    }
    
    document.body.classList.add('show-controlled');
    document.getElementById('controlled').scrollIntoView({behavior:'smooth',block:'start',inline:'nearest'});
});

const buttonOnClick = ((e) =>
{
    const cardId = e.target.dataset.cardId;
    if (cardId === selectedCardId)
        return;
    selectedCardId = cardId;
    selectedCardName = e.target.innerText;
    selectedArtId = null;
    selectedLocale = null;
    redrawControlled();
});

(async () =>
{
    try
    {
        manifest = await fetch('/manifest.json').then(r => r.json());
    } catch (e) {
        console.error(e);
        manifest = false;
    }
    redrawControlled();
})();

redrawControlled();

for (const btn of document.querySelectorAll('#intro2 button'))
    btn.addEventListener('click', buttonOnClick);

document.getElementById('select-artid').addEventListener('change', (e) =>
{
    selectedArtId = e.target.value;
    if (selectedArtId === '__null')
        selectedArtId = null;
    redrawControlled();
});

document.getElementById('select-locale').addEventListener('change', (e) =>
{
    selectedLocale = e.target.value;
    if (selectedLocale === '__null')
        selectedLocale = null;
    redrawControlled();
});

})();
