const fs                     = require('fs');

const getPlayersForEvent     = require('./startFunctions/getPlayersForEvent');
const updateHealthForPlayers = require('./startFunctions/updateHealthForPlayers');
const replaceEventTargets    = require('./startFunctions/replaceEventTargets');
const generateTargetMessages = require('./startFunctions/generateTargetMessages');
const outputRoundMessages    = require('./startFunctions/outputRoundMessages');
//const equipItems             = require('./startFunctions/equipItems');

module.exports = ( Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomFrom, prevPlayerList, winsNeeded, startRematch, stats, betStatus ) => {
  gameStatus.started = true;
  betStatus.open = true;

  const startGameRound = async () => {
    /* Variables */
    let event = randomFrom(events); // A random event for this round.
    let eventPlayers = []; // All players for the current event.
    let eventTargetIdxs = [];
    let playersDied = 0; // To check if a player died this round to type it out.
    let obtainedItem = {}; // To save item for print-out after obtained.
    let roundWinner = { wins: -1 }; // Winner of the current game round.

    /* Functions for settings variables from child components */
    const setEffectedTargets = effected => event.effectedTargets = effected; // If event targets ALL, update effected targets in events.json since there are no effected targets by default.
    const increasePlayersDied = () => playersDied++;
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

      fs.writeFile('./stats.json', JSON.stringify(stats), err => { // File path is based from root "./stats.json"
        err && console.log(err);
      });

      return clearPlayerLists();
    }
    const clearPlayerLists = () => (playerList.length = 0, deadPlayers.length = 0);
    const breakArmor = targetPlayer => targetPlayer.equipment.armor = { name: '', value: 0 };
    const updatePlayerList = winningPlayer => winningPlayer.wins += 1;
    const updatePrevPlayerList = winningPlayerId => prevPlayerList.find(player => player.id === winningPlayerId).wins += 1; // Add win to prevPlayerList before rematch

    /* If there are more targets than active players for the event, ignore and restart the game loop to pick a new */
    if ( (event.targets > playerList.length) && event.targets !== 'all' ) { startGameRound(); return; }

    /* Getting random players for the current event */
    await getPlayersForEvent(event, eventPlayers, randomFrom, playerList, setEffectedTargets, eventTargetIdxs);

    /* När man blir trollad till en zebra ser man ut som en zebra */
    if ( event.description.includes("till en zebra") ) {
      playerList[eventTargetIdxs[0]].url = 'https://tiergarten.nuernberg.de/fileadmin/bilder/Tierinformationen/Bilder/Wueste/Grevyzebra.jpg';
      playerList[eventTargetIdxs[0]].title = 'Ett med naturen';
    }
  
    /* Equipping item, should be in own function when bigger */
    if ( event.itemType ) {
      obtainedItem = await randomFrom(armors);
      playerList[eventTargetIdxs[0]].equipment.armor.name = obtainedItem.name;
      playerList[eventTargetIdxs[0]].equipment.armor.value = obtainedItem.value;
    }

    /* Update health for effected targets and remove dead players */
    if ( !event.itemType ) {
      await updateHealthForPlayers(event, playerList, deadPlayers, increasePlayersDied, breakArmor, eventTargetIdxs);
    }    

    /* Creating the event by replacing targets with the correct targeted players names */
    let roundMessage = await replaceEventTargets(event, eventPlayers, obtainedItem);

    /* Generate messages for HP loss/gain and show life bars */
    let effectedTargetsMessages = [];
    await generateTargetMessages(bot, event, eventPlayers, effectedTargetsMessages);
 
    await outputRoundMessages(roundMessage, effectedTargetsMessages, message, Discord, playersDied, deadPlayers, playerList, changeGameStatus, updatePlayerList, updatePrevPlayerList);

    if ( gameStatus.started === false ) {

      /* Rewarding players with coins for wins. Maybe move to winnerEmbed? */
      if ( roundWinner.id > 100 ) { // No coins for bot players
        if ( stats[roundWinner.id].coins == null ) { stats[roundWinner.id].coins = 0 }
        const winnerPrice = Math.round(50 * (prevPlayerList.length * 0.65))
        stats[roundWinner.id].coins += winnerPrice;
        message.channel.send(`Congratulations **${roundWinner.name}**, you earned **${winnerPrice}** coins by winning! :money_mouth:`);
      }

      /* Rewarding betting players with coins if they guessed correctly */
      if ( roundWinner.placedBets.length > 0 ) {
        roundWinner.placedBets.forEach(bet => {
          stats[bet.player.id].coins += bet.earnings;
          message.channel.send(`Nice betting ${bet.player}, you just cashed in **${bet.earnings}** coins! :moneybag:`);
        })
      }

      fs.writeFile('./stats.json', JSON.stringify(stats), err => {
        err && console.log(err);
      });

      if ( roundWinner.wins < winsNeeded ) {
        return startRematch(message, winsNeeded);
      } else {
        return message.channel.send(`Bow down to our new champion **${roundWinner.name}**!`);
      }
    }

    message.channel.send('_ _'); // Outputs an empty line in Discord for some reason, this makes the messages easier to read.
    return setTimeout(startGameRound, 6000); // Run itself every 6 seconds.
  }

  let betMessage = 'Place your bets now! \n \n'; // To ouput one message instead of several which causes Discord to lag.
  playerList.forEach((player, idx) => {
    betMessage += `**${player.name}** - !bet **${idx + 1}** [coins] \n`;
  })
  message.channel.send(betMessage);
  message.channel.send('_ _');

  const closeBets = () => {
    /* Close betting and output list of bets */
    betStatus.open = false;
    let betTable = '==== Bets placed for this round ==== \n \n';
    playerList.forEach(player => {
      if ( player.placedBets.length > 0 ) {
        betTable += `-- ${player.name} -- \n`;
        player.placedBets.forEach((bet, idx) => {
          betTable += `${bet.player} bet: **${bet.amount}** coins \n`;
          if ( idx === player.placedBets.length - 1 ) betTable += '\n'; // Add extra new line to last bet for better layout spacing.
        })
      }
    })
    message.channel.send(betTable);
    message.channel.send('_ _');
  }

  setTimeout(closeBets, 25000)

  setTimeout(startGameRound, 28000); // Initial start of the game round.
}