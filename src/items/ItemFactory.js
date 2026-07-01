import Item from "./Item.js";
import { itemData } from './ItemData.js';

export function createItem(itemId) {
    const data = itemData[itemId];
    return new Item(data.name, data.slot, data.stats);
}