import { location } from "./location";

/**
 * @description This represents a furry friend.
 */
export interface Pet {
  /**
   * @description A unique identfier for a pet.
   */
  id: string;
  /**
   * @description A peculiar, sensible, everyday name.
   */
  name: string;
  /**
   * @description A list of tags used for searching.
   * @since 2019-10-10
   */
  tags: Array<string>;

  location: location;
}
