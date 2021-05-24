import { exchangeCards } from "../../src/gameStore";
import Cookies from "cookies";

export default async function handler(req, res) {
  const cookies = new Cookies(req, res);
  const playerId = cookies.get("playerId");
  const gameId = req.body.gameId;

  const indexs = !req.body.indexs ? [] : [...req.body.indexs];//retrieval of indexs

  await exchangeCards(gameId, playerId, indexs);//exchange the cards for new ones
  return res.redirect(`/games/${gameId}`);//redirect back to game screen
}
