export type ItemId = string;

/** Basket contents: catalogue item slug -> quantity. */
export type Basket = Record<ItemId, number>;
