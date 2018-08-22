const getPlayersForEvent     = require('./startFunctions/getPlayersForEvent');
const updateHealthForPlayers = require('./startFunctions/updateHealthForPlayers');
const replaceEventTargets    = require('./startFunctions/replaceEventTargets');
const generateTargetMessages = require('./startFunctions/generateTargetMessages');
const outputRoundMessages    = require('./startFunctions/outputRoundMessages');

module.exports = ( Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomFrom ) => {
  gameStatus.started = true;

  function startGameRound() {
    /* Variables */
    let event = randomFrom(events); // A random event for this round.
    let eventPlayers = []; // All players for the current event.
    let playersDied = 0; // To check if a player died this round to type it out.
    let obtainedItem = {}; // To save item for print-out after obtained.

    /* Functions for settings variables from child components */
    const setEffectedTargets = (effected) => event.effectedTargets = effected; // If event targets ALL, update effected targets in events.json since there are no effected targets by default.
    const increasePlayersDied = () => playersDied++;
    const changeGameStatus = () => gameStatus.started = false;
    const clearPlayerLists = () => (playerList.length = 0, deadPlayers.length = 0);
    const breakArmor = (targetPlayer) => targetPlayer.equipment.armor = { name: '', value: 0 };

    /* If there are more targets than active players for the event, ignore and restart the game loop to pick a new */
    if ( (event.targets > playerList.length) && event.targets !== 'all' ) { startGameRound(); return; }

    /* Getting random players for the current event */
    getPlayersForEvent(event, eventPlayers, randomFrom, playerList, setEffectedTargets);
  
    /* Equipping item, should be in own function */
    if ( event.itemType ) {
      // Needs to be updated in loop with eventIdx code.
      let currPlayer = playerList.indexOf(eventPlayers[0]);
      obtainedItem = randomFrom(armors);
      playerList[currPlayer].equipment.armor.name = obtainedItem.name;
      playerList[currPlayer].equipment.armor.value = obtainedItem.value;
    }




    /* Update health for effected targets and remove dead players */
    if ( !event.itemType ) {
      updateHealthForPlayers(event, playerList, eventPlayers, playersDied, deadPlayers, increasePlayersDied, breakArmor);
    }    

    /* Creating the event by replacing targets with the correct targeted players names */
    let roundMessage = replaceEventTargets(event, eventPlayers, obtainedItem);

    /* Generate messages for HP loss/gain and show life bars */
    let effectedTargetsMessages = [];
    generateTargetMessages(bot, event, eventPlayers, effectedTargetsMessages);

    /* Output event and effected player messages + death/win-messages */
    outputRoundMessages(roundMessage, effectedTargetsMessages, message, Discord, playersDied, deadPlayers, playerList, changeGameStatus, clearPlayerLists);

    /* If game has ended, break */
    if ( gameStatus.started === false ) return false;

    setTimeout(startGameRound, 6000); // Run itself every 6 seconds.
    return message.channel.send('_ _'); // Outputs an empty line in Discord for some reason which makes messages easier to read.
  }

  startGameRound(); // Initial start of the game round.
}