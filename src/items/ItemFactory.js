import Item from "./Item.js";
import { itemData } from './ItemData.js';

export function createItem(key) {
    const data = itemData[key];
    return new Item(data.name, data.slot, data.stats);
}