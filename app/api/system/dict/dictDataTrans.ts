import { LocalDict } from "@/types/api";
import { DictItemWithID } from "@/types/system/dictionary";

export function toLocalDict(dict: DictItemWithID): LocalDict {
    return {
        id: dict.id,
        name: dict.name,
        description: dict.description,
        values: dict.values,
    }
}

export function toLocalDictList(dicts: DictItemWithID[]): LocalDict[] {
    return dicts.map(toLocalDict)
}
