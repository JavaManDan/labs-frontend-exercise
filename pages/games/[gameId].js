import Cookies from "cookies";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { allPlayersJoined, getGame } from "../../src/gameStore";
import GameStyle from '../../styles/gamePageStyle.module.css'

export async function getServerSideProps(context) {
  const gameId = context.params.gameId;
  const cookies = new Cookies(context.req, context.res);
  const playerId = cookies.get("playerId");

  let gameState;
  try {
    gameState = getGame(gameId);
  } catch (err) {
    // game not found
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }

  if (!allPlayersJoined(gameState)) {
    return {
      redirect: {
        destination: `/games/${gameId}/pending`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      currentPlayer: gameState.players[playerId],
    },
  };
}

const Game = ({ currentPlayer: { cards, exchanged } }) => {
  const router = useRouter();
  const { gameId } = router.query;

  //window size state
  const [windowSize, setWindowSize] = useState({ width: undefined, height: undefined });

  useEffect(() => {
    //browser resizing 
    const resizeBrowser = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });//set the window width/height to state
    window.addEventListener("resize", resizeBrowser);
    resizeBrowser();
    return () => window.removeEventListener("resize", resizeBrowser)
  }, [])

  let condition = windowSize.width < 800;//for mobile/ browser styles

  const individualCard = (obj, i) => {//individual cards + the discard button / chk box
    return (
      <div className={condition ? GameStyle.mobileIndividualCard : GameStyle.individualCard}>
        <img src={obj.images.png} className={condition ? GameStyle.mobileCardImage : GameStyle.cardImage} />
        <div className={condition ? GameStyle.mobileDiscard : GameStyle.discard}>
          <input type="checkbox" className={GameStyle.checkbox} />
          <p className={condition ? GameStyle.mobileText : GameStyle.text}>
            Discard
          </p>
        </div>
      </div>
    )
  }

  const cardComps = cards.map((cObj, i) => individualCard(cObj, i));//the players cards

  return (
    <div>
      <div className={condition ? GameStyle.mobileContainer : GameStyle.container}>
        {/* The playing card(s) container */}
        <div className={condition ? GameStyle.mobileCardContainer : GameStyle.cardContainer}>
          {cardComps}
        </div>
        <div className={condition ? GameStyle.mobileBurnButtonContainer : GameStyle.discardContainer}>
          {
            condition ?
              //if - for mobile version
              <input
                className={GameStyle.mobileBurnButton}
                value="Burn selected cards" /> :
              //else - for the browser version 
              <Fragment>
                  <h1 className={GameStyle.title}> 5 Card Draw </h1>
                  <h4 className={GameStyle.titleH4}> It's like poker but easy </h4>
                  <button className={GameStyle.burnButton}>
                    Burn selected cards
                  </button>
              </Fragment>
            }
        </div>
      </div>
    </div>
  );
};

export default Game;
