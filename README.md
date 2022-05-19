# artworks.ygorganization.com
<sup>_(go to: [Getting the data](#getting-the-data), [Using the data](#using-the-data), [Interactive demo](https://artworks.ygorganization.com))_</sup>

The Yu-Gi-Oh! community is integral to its own enjoyment of the game, in many ways. Would you be as engaged as you are if it wasn't for deck profiles, tournament commentary, and online deckbuilders? There are so many invaluable player-made tools out there!

However, these tools often need to rely on player-created card renders. This can cause outdated names and incorrect information to be displayed prominently, and leads to confusion and frustration. Even then, it does not have to be this way -- KONAMI _does_ publish proper card proxies after all, through their [Card Database](https://www.db.yugioh-card.com/) and the [Yu-Gi-Oh! NEURON app](https://www.konami.com/games/eu/en/products/yugioh_neuron/).

This repository provides a standardized way for player tools to access these KONAMI-created artworks, so you can get accurate information straight from the source. That's really all there is to it.

## Getting the data
<sup>_(go to: [Top](#artworksygorganizationcom), [Using the data](#using-the-data), [Interactive demo](https://artworks.ygorganization.com))_</sup>

However you use the repository, please keep in mind that there are over 10,000 cards in existence. Multiply this by eight supported languages, add Neuron artworks, and you're looking at just over 100,000 images. Even at under 50 kilobytes per image thanks to strong compression, this repository consists of more than four gigabytes of data. Please avoid unnecessarily (and, especially, repeatedly) downloading the entire thing. We don't want to get kicked off Github because you murdered their servers -- they're generous enough to host this stuff for free.

Below are the appropriate ways to access the data. Depending on your use case, one of the two will likely be appropriate for you. If neither seems to quite fit, please get in touch before doing something reckless.

### 1. If you need individual card artworks on demand

Access them via [`https://artworks.ygorganization.com/`](https://artworks.ygorganization.com/). This is a hosted copy of this repository powered by [GitHub pages](https://pages.github.com/), and brought to you via [Cloudflare](https://www.cloudflare.com/). Every file in this repository is available at this URL. For example, if the usage section refers to `manifest.json`, that file can be found at [`https://artworks.ygorganization.com/manifest.json`](https://artworks.ygorganization.com/manifest.json).

This option is best for web applications, as well as applications that only need a small handful of artworks in the average use case. An example would be online deck viewers, or deck profile image generators.

### 2. If you need access to all artworks

You will want to clone this repository from GitHub. Please keep full clones of the whole thing to a minimum. Keep your local copy of the repository up to date by pulling from the remote repository, which will only download the necessary changes.

If you are distributing an application that uses this approach, please bundle a reasonably-recent clone with it, and base your update logic on that. Do _not_ have each user clone the entire repo on first run.

This option is best if you actually need all the artworks, since Git lets you keep your local copy up-to-date efficiently. As an example, you'd want this if you're looking to compile image fingerprints of every card in the game for your card recognition software.

## Using the data
<sup>_(go to: [Top](#artworksygorganizationcom), [Getting the data](#getting-the-data), [Interactive demo](https://artworks.ygorganization.com))_</sup>

Once you've figured out a good way to access the data, you'll want to look at [`manifest.json`](https://artworks.ygorganization.com/manifest.json) in the repository root. This file serves as an index of the entire repository's contents.

_(Do **not** rely on any details of our file paths to try and guess them on your own. Repository structure and file paths may change without notice. File paths may not remain uniform across the entire repository, either. Please use `manifest.json`.)_

The manifest's `.cards` entry is an object, which is indexed by cards' database ID. This is the same ID used by [the YGOrganization Database](https://db.ygorganization.com/) and KONAMI's own [Card Database](https://www.db.yugioh-card.com/). As an example, _Dark Magician_'s database ID is `4041`.

Each entry in `.cards` is another object, indexed by the artwork IDs available for the respective card. Artwork IDs are assigned by KONAMI. All cards currently use numeric values, but this is an implementation detail and should not be relied upon. To give an example, data for Dark Magician's first artwork can currently be accessed as `manifestData.cards['4041']['1']`.

Once you've found the data for the artwork you are looking for, you have three images immediately available to you, as members of the artwork data object. These are:

* `.bestTCG`, which is the highest-resolution version of the artwork available in the Trading Card Game
* `.bestOCG`, which is the highest-resolution version of the artwork available in the Official Card Game
* `.bestArt`, which is the highest-resolution version of the artwork available in either of the above

In the vast majority of situations, `.bestArt` is what you want, as it will always be available. Even if you choose one of the other two, keep in mind that these values may not always be available, as some artworks only exist in one of the two CGs. How you handle this is up to you. To give an example, `manifestData.cards['4041']['1'].bestArt` is the highest resolution version of Dark Magician's first artwork that's available.

Sometimes, you want finer-grained control, want a particular language's artwork, or want to iterate over all the files available. For these applications, the artwork data object also contains the `.idx` member, which is further sub-indexed by the two-letter locale code of each locale the artwork is available for. This gets you an array of `{ path, source }` objects listing all images for the specified card artwork and locale. This array is sorted by descending resolution. For example `manifestData.cards['4041']['1'].idx.de[0].path` is the highest-resolution German version of Dark Magician's first artwork that's available. Keep in mind that the `.de` key may not exist for every artwork.

_(The `source` value is an internal identifier, and is currently considered to be an implementation detail. Do not rely on its value at this time.)_

All paths listed in `manifest.json` are relative to the repository root. For example, a value of `/foo/bar/baz.png` refers to the artwork at `https://artworks.ygorganization.com/foo/bar/baz.png`.

That's all. We also have an [interactive demonstrator](https://artworks.ygorganization.com) for you to peruse. If anything is unclear, or you think this documentation could be improved, please don't hesitate to get in touch.
