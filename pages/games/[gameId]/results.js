import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "cookies";
import { getGame } from "../../../src/gameStore";
import GameStyle from '../../../styles/gamePageStyle.module.css'

export async function getServerSideProps(context) {
    const Hand = require('pokersolver').Hand;//library for solving hands

    const gameId = context.params.gameId;
    const cookies = new Cookies(context.req, context.res);
    const playerId = cookies.get("playerId");

    let gameState;
    try {
        gameState = getGame(gameId);
    } catch (err) {
        console.log(err)
        return {
            redirect: {
                destination: `/`,
                permanent: false,
            },
        };
    }
    try {//try and catch errors (likely duplicate hand)
        const players = gameState.players;

        //retrieve all hands - map to array of string values (card suit/ denominations e.g. 4H)
        const playerHands = Object.values(players).map(handArr => handArr.cards.map(cardObj => (cardObj.code).replace('0', 'T')));//T (10) is 0 in hand solver

        //const hand1 = Hand.solve(['Ad', 'As', '3c', 'Th', '2d']);//test
        const solvedHands = playerHands.map(hand => Hand.solve(hand));

        //the best hand of all players
        const winningHand = Hand.winners(solvedHands);
        //hand description
        const bestHandDescription = winningHand[0].descr;
        //the best hand index
        const bestHandIndex = solvedHands.findIndex(c => c.descr === winningHand[0].descr);
        const bestHand = Object.values(players).map(handArr => handArr.cards)[bestHandIndex];
        //console.log('current player has best hand?);
        //console.log(gameState.players[playerId].cards === bestHand);
        return {
            props: {
                currentPlayer: gameState.players[playerId],//current player
                bestHand: bestHand,//best hand (winning hand)
                isPlayerWinner: gameState.players[playerId].cards === bestHand,//does current player have the best hand
                winningHandDesc: bestHandDescription,//the description of best hand e.g. Pair, 10's
                playerHandDesc: Hand.solve(gameState.players[playerId].cards.map(cardObj => (cardObj.code).replace('0', 'T'))).descr//the description of players hand e.g. 'Pair, 2's
            }
        }
    } catch (e) {
        //most likley duplicate cards error , the library for checking poker hands throws an error if the hand contains duplicates
        //e.g. 4H 4H AS 9D 8H = this happens also with the second library I checked.
        // used --> https://github.com/goldfire/pokersolver
        //not used --> https://npm.io/package/poker-hand-evaluator
        console.log(e);
        return {
            redirect: {
                destination: `/`,
                permanent: false,
            }
        }
    }
}

const Results = ({ currentPlayer: { cards }, bestHand, isPlayerWinner, winningHandDesc, playerHandDesc }) => {
    //window size state
    const [windowSize, setWindowSize] = useState({ width: undefined, height: undefined });

    useEffect(() => {
        //browser resizing 
        const resizeBrowser = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });// Set window width/height to state
        window.addEventListener("resize", resizeBrowser);
        resizeBrowser();
        return () => window.removeEventListener("resize", resizeBrowser);
    }, []);

    let condition = windowSize.width < 800;// for mobile/ browser styles

    const individualCard = (obj) => {// for the cards
        return (
            <div className={condition ? GameStyle.mobileIndividualCard : GameStyle.individualCard}>
                <img src={obj.images.png} className={condition ? GameStyle.mobileCardImage : GameStyle.cardImage} />
            </div>
        )
    }

    //players hand
    const cardObjs = cards.map(cObj => individualCard(cObj));

    //the best hand 
    const winningHand = bestHand.map(cObj => individualCard(cObj))

    return (
        <div>
            <h1>{isPlayerWinner ? 'You Won!' : 'You Lost!'} - You had: {playerHandDesc}</h1>
            <div className={condition ? GameStyle.mobileContainer : GameStyle.container}>
                <div className={condition ? GameStyle.mobileCardContainer : GameStyle.cardContainer}>
                    {cardObjs}
                </div>
            </div>
            <br />
            <h1> Winning Hand: {winningHandDesc}</h1>
            <div className={condition ? GameStyle.mobileContainer : GameStyle.container}>
                <div className={condition ? GameStyle.mobileCardContainer : GameStyle.cardContainer}>
                    {winningHand}
                </div>
            </div>
        </div>
    )

}

export default Results;