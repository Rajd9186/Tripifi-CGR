import { redirect } from "next/navigation";

/** Alias: the bottom nav calls saved trips "Favorites". */
export default function FavoritesAlias() {
  redirect("/wishlist");
}
