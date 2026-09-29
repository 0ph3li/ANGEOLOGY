/* =========================================================
   ANGEOLOGY — product catalogue (shared by every page)
   img: file in img/ (a placeholder is shown until it exists)
   shades[0] is the colour of the product as photographed;
   picking another shade recolours the photo.
   orbit: position in the home page "bestsellers in orbit"
   ========================================================= */
window.ANGEOLOGY_PRODUCTS = [
  { id: 'ribbon-tint', name: 'Ribbon Tint', latin: 'Taenia labialis', cat: 'lips', price: 22, img: 'product-1.webp', label: 'shade', best: 1, orbit: 1,
    desc: 'A lip & cheek duo tied up in satin: one sheer berry balm, one cooling highlight stick. Plant-based, beeswax-free.',
    shades: [['Berry', '#c8375a'], ['Peony', '#e7729a'], ['Coral', '#e0604e'], ['Plum', '#8e2f5f']] },
  { id: 'seraph-blush', name: 'Seraph Blush', latin: 'Gena rubescens', cat: 'face', price: 24, img: 'product-2.webp', label: 'shade', best: 2, orbit: 2,
    desc: 'A pressed powder blush embossed with tiny bows, in a compact that opens like a gift. Carmine-free pinks.',
    shades: [['Petal', '#e7a9bf'], ['Peach', '#f0b097'], ['Lilac', '#cfa9d9'], ['Rose', '#d9788f']] },
  { id: 'fallen-lash', name: 'Fallen Lash', latin: 'Cilia nocturna', cat: 'eyes', price: 16, img: 'product-3.webp', label: 'case', best: 4, orbit: 3,
    desc: 'Wispy vegan lashes in a heart-shaped case, glue included. Never mink, silk or feathers — reusable up to 20 wears.',
    shades: [['Blush', '#f1ccd1'], ['Lilac', '#dcc9ef'], ['Mint', '#c6e6df'], ['Peach', '#f6d0bb']] },
  { id: 'wingtip-liner', name: 'Wingtip Liner', latin: 'Ala acuta', cat: 'eyes', price: 17, img: 'product-4.webp', label: 'pen', best: 5, orbit: 4,
    desc: 'A felt-tip liner in a pastel pen, sharp enough to draw wings on a storm. Smudge-proof, all-night black.',
    shades: [['Blush', '#e8c4c8'], ['Lilac', '#d6c6ea'], ['Sky', '#c7d9ef'], ['Butter', '#f1e2b8']] },
  { id: 'pearl-dew', name: 'Pearl Dew', latin: 'Ros margarita', cat: 'face', price: 28, img: 'product-5.webp', label: 'compact', best: 3, orbit: 5,
    desc: 'A baked highlighter carved with bows, cradled in a pink-and-gold compact. Glows like a pearl held up to the moon.',
    shades: [['Rose', '#ea8fb0'], ['Lilac', '#c59be0'], ['Peach', '#f2a58a'], ['Mint', '#8fd3c0']] },
  { id: 'sin-satin', name: 'Sin & Satin', latin: 'Peccatum sericum', cat: 'lips', price: 26, img: 'product-6.webp', label: 'shade', best: 6, orbit: 6,
    desc: 'A satin lipstick crowned with a little glass unicorn. Vegan wax, zero lanolin.',
    shades: [['Nude', '#c98c86'], ['Berry', '#9b2f55'], ['Red', '#c0283a'], ['Mauve', '#a86f8f']] },

  { id: 'pearl-palette', name: 'Pearl Palette', latin: 'Tabula margaritarum', cat: 'eyes', price: 42, palette: true, best: 7, isNew: true,
    desc: 'Twelve pans from halo to fallen: four velvet mattes, four pearl shimmers, four vegan glitters. One mirror, zero animal ingredients.',
    shades: [] },
  { id: 'halo-gloss', name: 'Halo Gloss', latin: 'Labium angelicum', cat: 'lips', price: 18, img: 'product-8.webp', label: 'shade', best: 8, isNew: true,
    desc: 'A sheer, glitter-flecked gloss in a squeezy tube that catches light like a halo. Plant-based shine, no beeswax, never sticky.',
    shades: [['Halo', '#f0d6dd'], ['Blush', '#e89aae'], ['Glass', '#f5eadc'], ['Rosary', '#c46a80']] },
  { id: 'baby-skin', name: 'Baby Skin', latin: 'Cutis infantis', cat: 'face', price: 32, img: 'product-9.webp', label: 'shade', best: 9,
    desc: 'A dewy liquid skin tint in a crystal-capped bottle, light as a sigh. Vegan hyaluronic acid, no lanolin.',
    shades: [['01 Porcelain', '#f1dccb'], ['04 Bisque', '#e6bea2'], ['07 Honey', '#c89068'], ['10 Cocoa', '#8a5a3c']] },
  { id: 'angel-dust', name: 'Angel Dust', latin: 'Pulvis caelestis', cat: 'eyes', price: 15, img: 'product-10.webp', label: 'glitter', best: 10, isNew: true,
    desc: 'A pressed glitter topper made of plant-cellulose sparkle that biodegrades. For lids, cheeks and collarbones.',
    shades: [['Opal', '#efdcee'], ['Rose', '#f3b3c8'], ['Gold', '#e2c48f'], ['Onyx', '#3a3336']] },
  { id: 'cloud-veil', name: 'Cloud Veil', latin: 'Nubes pulverea', cat: 'face', price: 34, img: 'product-11.webp', label: 'finish', best: 11,
    desc: 'A lace-embossed pressed powder with its own mini kabuki, in a jewel-box compact. Blurs like a soft-focus lens. Talc-free, silk-free.',
    shades: [['Rose', '#f3d3db'], ['Sheer', '#f6ece6'], ['Lilac', '#e8dcef']] },
  { id: 'bunny-brow', name: 'Bunny Brow', latin: 'Supercilium lepidum', cat: 'eyes', price: 21, img: 'product-12.webp', label: 'shade', best: 12,
    desc: 'A micro brow pencil and a tinted brow gel that brushes brows up like a bunny’s ears. Synthetic spoolie, no beeswax.',
    shades: [['Taupe', '#a89c92'], ['Blonde', '#c9a27a'], ['Brunette', '#6e4a36'], ['Noir', '#2a2020']] },
  { id: 'rosary-liner', name: 'Rosary Liner', latin: 'Linea rosarii', cat: 'lips', price: 16, img: 'product-13.webp', label: 'shade', best: 13,
    desc: 'A creamy twist-up lip liner that prays your lipstick stays put. Vegan waxes, no sharpener needed.',
    shades: [['Blush', '#dba0ad'], ['Nude', '#b98078'], ['Berry', '#8e2f58'], ['Wine', '#5a1a2e']] },
  { id: 'holy-mist', name: 'Holy Water', latin: 'Aqua benedicta', cat: 'face', price: 24, img: 'product-14.webp', label: 'bottle', best: 14,
    desc: 'A rose-water setting mist in a cherub-topped glass bottle that keeps your face in place all night. Blessed, never tested.',
    shades: [['Rose', '#ecdfe5'], ['Lilac', '#dcd3ee'], ['Blush', '#f3cbd6']] },
  { id: 'wing-brush', name: 'Wing Brush', latin: 'Penna synthetica', cat: 'tools', price: 24, img: 'product-15.webp', label: 'handle', best: 15,
    desc: 'A fluffy powder brush with a heart-crowned ferrule — soft as a feather, but never made of one. Synthetic bristles, recycled metal.',
    shades: [['Pink', '#f0c3d2'], ['Pearl', '#f1ebe7'], ['Lilac', '#d9c6ea']] },
  { id: 'cloud-puff', name: 'Cloud Puff', latin: 'Spongia nubis', cat: 'tools', price: 12, img: 'product-16.webp', label: 'colour', best: 16,
    desc: 'A teardrop velvet puff with a satin strap, for pressing powder into skin. Vegan microfibre, washable, latex-free.',
    shades: [['Pink', '#f3d3d8'], ['Lilac', '#dccdea'], ['Cream', '#f3e8dc']] },
];

window.ANGEOLOGY_CATEGORIES = [
  ['all', 'All'], ['face', 'Face'], ['eyes', 'Eyes'], ['lips', 'Lips'], ['tools', 'Tools'],
];

/* ---------- collections (collections.html, shop.html#<id>) ---------- */
window.ANGEOLOGY_COLLECTIONS = [
  { id: 'doll', num: '0', name: 'Doll', img: 'card-doll.jpg', photo: 'collection-doll.jpg', deco: 'bow.png',
    lede: 'Satin ribbons, blushed lids and a glass-skin glow. The collection for dolls who want to be adored — and to decide who gets to play.',
    fortune: 'You will be dressed up, adored and — occasionally — left on a shelf. Wear it anyway.',
    upright: 'sweetness, devotion, soft power', reversed: 'a little too perfect',
    mood: ['satin ribbons', 'glass skin', 'blushed lids', 'baby lashes'],
    products: ['seraph-blush', 'ribbon-tint', 'fallen-lash', 'cloud-puff'] },
  { id: 'fallen', num: 'I', name: 'Fallen', img: 'card-fallen.jpg', photo: 'collection-fallen.jpg', deco: 'pin.png',
    lede: 'Black bows, white-lined eyes and a halo slightly crooked. For angels who left heaven on purpose and never looked back.',
    fortune: 'You left heaven on purpose. The lighting is better down here.',
    upright: 'rebellion, mystery, sharp wings', reversed: 'crying at the party (in waterproof liner)',
    mood: ['black bows', 'white waterline', 'smudged wings', 'silver studs'],
    products: ['wingtip-liner', 'sin-satin', 'rosary-liner', 'bunny-brow'] },
  { id: 'bride', num: 'II', name: 'Bride', img: 'card-bride.jpg', photo: 'collection-bride.jpg', deco: 'pearl.png',
    lede: 'Frosted lids, pearls and dewy skin — a vow in every shade. Luminous, veil-soft and made without a single animal ingredient.',
    fortune: 'A promise is coming. Make sure it’s cruelty free.',
    upright: 'devotion, light, new beginnings', reversed: 'cold feet, warm highlighter',
    mood: ['pearls', 'frosted lids', 'veil-soft skin', 'morning dew'],
    products: ['pearl-dew', 'baby-skin', 'cloud-veil', 'holy-mist'] },
  { id: 'bunny', num: 'III', name: 'Bunny', img: 'card-bunny.jpg', photo: 'collection-bunny.jpg', deco: 'sparkles.png',
    lede: 'Flushed cheeks, glossy lips and glitter everywhere. Named for every rabbit that will never, ever be tested on.',
    fortune: 'Luck follows you — as long as nobody ever tests on a rabbit again.',
    upright: 'innocence, luck, sparkle', reversed: 'a sugar crash',
    mood: ['flushed cheeks', 'glitter lids', 'glossy lips', 'cotton candy'],
    products: ['angel-dust', 'halo-gloss', 'pearl-palette', 'wing-brush'] },
];

/* ---------- lookbook looks (lookbook.html, search.html) ----------
   wear: products worn in the look as [id, shade index] */
window.ANGEOLOGY_LOOKS = [
    { name: 'Lilac Lashes', img: 'look-1.jpg', col: 'bunny', note: 'Lilac lids, lashes out to here and a lip dipped in gloss.', wear: [['angel-dust', 0], ['fallen-lash', 1], ['halo-gloss', 0]] },
    { name: 'Doll Gaze', img: 'look-2.jpg', col: 'fallen', note: 'A sharp mint-teal wing, flushed cheeks, hands on the face — innocent until proven otherwise.', wear: [['wingtip-liner', 0], ['seraph-blush', 1], ['ribbon-tint', 1]] },
    { name: 'Glass Lips', img: 'look-3.jpg', col: 'fallen', note: 'Skin like glass, a lined nude lip and one tiny beauty mark.', wear: [['baby-skin', 1], ['rosary-liner', 1], ['halo-gloss', 2]] },
    { name: 'The Bow', img: 'look-4.jpg', col: 'doll', note: 'Satin bow, satin slip, satin skin. Blush placed high like a porcelain doll.', wear: [['seraph-blush', 0], ['pearl-dew', 0], ['cloud-veil', 0]] },
    { name: 'Afterglow', img: 'afterglow.jpg', col: 'doll', note: 'Powder-blue lids, a sharp little wing, doll blush worn high and a glossy nude — the glow after the party.', wear: [['pearl-palette', 0], ['wingtip-liner', 0], ['seraph-blush', 0]] },
    { name: 'Ribbon Kiss', img: 'card-doll.jpg', col: 'doll', note: 'Tangled in pink satin: a blushed lid, a bitten lip, a very good day.', wear: [['ribbon-tint', 1], ['seraph-blush', 0], ['cloud-puff', 0]] },
    { name: 'Fallen Bows', img: 'card-fallen.jpg', col: 'fallen', note: 'Black bows down the hair, a bright white waterline, a halo left at home.', wear: [['wingtip-liner', 0], ['sin-satin', 0], ['bunny-brow', 2]] },
    { name: 'Frost Bride', img: 'card-bride.jpg', col: 'bride', note: 'Icy lids, pearl-dusted cheeks and a vow you can actually keep.', wear: [['pearl-dew', 0], ['baby-skin', 0], ['holy-mist', 0]] },
    { name: 'Lucky Flush', img: 'card-bunny.jpg', col: 'bunny', note: 'Cheeks flushed like you just ran through a meadow — no rabbits were bothered.', wear: [['seraph-blush', 3], ['halo-gloss', 1], ['angel-dust', 1]] },
    { name: 'Mwah', img: 'hero-2.jpg', col: 'doll', note: 'Pink bows, sheer gloves and a kiss blown straight at the camera.', wear: [['ribbon-tint', 0], ['bunny-brow', 2], ['wing-brush', 0]] },
    { name: 'Bows & Blush', img: 'hero.jpg', col: 'doll', note: 'A dozen bows down the hair and a tint worn on lips and cheeks.', wear: [['ribbon-tint', 0], ['cloud-veil', 0], ['halo-gloss', 0]] },
    { name: 'Party Angels', img: 'shop-hero.jpg', col: 'bunny', note: 'Three angels, one bathroom mirror and a lot of shared gloss.', wear: [['halo-gloss', 1], ['angel-dust', 2], ['pearl-palette', 0]] },
  ];
