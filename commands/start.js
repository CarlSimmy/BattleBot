const fs                     = require('fs');

const outputBetLists         = require('./startFunctions/outputBetLists');
const getPlayersForEvent     = require('./startFunctions/getPlayersForEvent');
const updateHealthForPlayers = require('./startFunctions/updateHealthForPlayers');
const replaceEventTargets    = require('./startFunctions/replaceEventTargets');
const generateTargetMessages = require('./startFunctions/generateTargetMessages');
const outputRoundMessages    = require('./startFunctions/outputRoundMessages');
const checkIfRoundFinished   = require('./startFunctions/checkIfRoundFinished');
const followUpEvent          = require('./startFunctions/followUpEvent');
//const equipItems           = require('./startFunctions/equipItems');

module.exports = ( Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomUniqueFrom, prevPlayerList, winsNeeded, startRematch, stats, betStatus ) => {

  /* Check when game starts and when betting is available */
  gameStatus.started = true;
  betStatus.open = true;

  const startGameRound = async(nextEvent = false, nextPlayer = false) => {
    /* Variables */
    let event = nextEvent ? nextEvent : randomUniqueFrom(events); // A random event for this round.
    let eventTargetIdxs = []; // Indices of effected targets in playerList.
    let playersDied = 0; // To check if a player died this round to type it out.
    let obtainedItem = {}; // To save item for print-out after obtained.
    let roundWinner = { wins: -1 }; // Winner of the current game round.

    /* Functions for settings variables from child components */
    const setEffectedTargets = effected => event.effectedTargets = effected; // If event targets ALL, update effected targets in events.json since there are no effected targets by default.
    const increasePlayersDied = () => playersDied++; // To check how many players died this round, used when outputting R.I.P messages.
    const changeGameStatus = winningPlayer => {
      roundWinner = winningPlayer;
      gameStatus.started = false;

      /* Save player win to stats file */
      if ( winningPlayer.id > 100 ) {
        if ( !stats[winningPlayer.id] ) { stats[winningPlayer.id] = { wins: 0 }; } // If player is not in file, add them first.
        stats[winningPlayer.id].wins += 1;
      } else { // Adding all bot players as id "0". >100 check is probably good enough for now since people won't add more than 100 bots?
        if ( !stats[0] ) { stats[0] = { wins: 0 }; }
        stats[0].wins += 1;
      }

      fs.writeFile('./lists/stats.json', JSON.stringify(stats), err => {
        err && console.log(err);
      });

      return clearPlayerLists();
    }
    const clearPlayerLists = () => (playerList.length = 0, deadPlayers.length = 0);
    const breakArmor = targetPlayer => targetPlayer.equipment.armor = { name: '', value: 0 };
    const updatePlayerList = winningPlayer => winningPlayer.wins += 1;
    const updatePrevPlayerList = winningPlayerId => prevPlayerList.find(player => player.id === winningPlayerId).wins += 1; // Add win to prevPlayerList before rematch.
    const initiateRematch = () => startRematch(message, winsNeeded); // Rematch function added here since roundFinished.js can't directly call index.js.

    /* If there are more targets than active players for the event, ignore and restart the game loop to pick a new */
    if ( (event.targets > playerList.length) && event.targets !== 'all' ) return startGameRound();

    /* Getting random players for the current event */
    await getPlayersForEvent(event, randomUniqueFrom, playerList, setEffectedTargets, eventTargetIdxs, nextPlayer);

    /* När man blir trollad till en zebra ser man ut som en zebra */
    if ( event.description.includes("till en zebra") ) {
      playerList[eventTargetIdxs[0]].url = 'https://tiergarten.nuernberg.de/fileadmin/bilder/Tierinformationen/Bilder/Wueste/Grevyzebra.jpg';
      playerList[eventTargetIdxs[0]].title = 'Ett med naturen';
    }
  
    /* Equipping item, should be in own function when bigger */
    if ( event.itemType ) {
      event.armor ? obtainedItem = event.armor : obtainedItem = await randomUniqueFrom(armors); // Check if there is a specified armor or not for the event.
      playerList[eventTargetIdxs[0]].equipment.armor.name = obtainedItem.name;
      playerList[eventTargetIdxs[0]].equipment.armor.value = obtainedItem.value;
    }

    /* Creating the event by replacing targets with the correct targeted players names */
    let roundMessage = await replaceEventTargets(event, playerList, eventTargetIdxs, obtainedItem);

    /* If there is a follow-up to the event, wait for it to play out before continuing */
    if ( event.followUpEvents ) {
      let newData = await followUpEvent(bot, Discord, message, randomUniqueFrom, event, roundMessage, playerList, eventTargetIdxs, startGameRound);
      return startGameRound(newData.event, newData.player);
    }

    /* Update health for effected targets and remove dead players */
    if ( !event.itemType ) {
      await updateHealthForPlayers(event, playerList, increasePlayersDied, breakArmor, eventTargetIdxs);
    }    

    /* Generate messages for HP loss/gain and show life bars */
    let effectedTargetsMessages = [];
    await generateTargetMessages(bot, event, playerList, eventTargetIdxs, effectedTargetsMessages);
 
    /* Moving dead players before outputting round messages */
    playerList.forEach((player, idx) => {
      if ( player.health <= 0 ) {
        deadPlayers.push(...playerList.splice(idx, 1));
      }
    })

    /* Output the messages for events and players dying/winning */
    await outputRoundMessages(roundMessage, effectedTargetsMessages, message, Discord, playersDied, deadPlayers, playerList, changeGameStatus, updatePlayerList, updatePrevPlayerList);

    /* At the end of every loop; If a round is finished, output winner, winning bets and check if there are still more rounds to play. If round is not finished, restart the game loop again */
    await checkIfRoundFinished(message, gameStatus, roundWinner, stats, prevPlayerList, fs, winsNeeded, initiateRematch, startGameRound);
  }

  outputBetLists(message, playerList, betStatus, Discord, stats); // Outputs players to bet on and placed bets before a round starts.
  setTimeout(startGameRound, 2000); // Initial start of the game round, 5 seconds after outputting bet list.
}