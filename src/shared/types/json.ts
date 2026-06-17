export type JsonValue = string | number | boolean | null | JsonObject | JsonArray

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

export function serializeJson(value: JsonValue | undefined): string | null {
  if (value === undefined) {
    return null
  }

  return JSON.stringify(value)
}

export function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) {
    return null
  }

  return JSON.parse(value) as T
}
