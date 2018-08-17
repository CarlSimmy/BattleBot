module.exports = ( Discord, bot, message, events, gameStatus, playerList, deadPlayers, randomFrom ) => {
  gameStatus.started = true;

  function startGameRound() {
    let event = randomFrom(events); // A random event for this round.
    let eventPlayers = []; // All players for the current event.
    let eventTargetIdxs = []; // All targets for the current event, both + and - damage.
    let activeTarget = -1; // Increasing counter to replace <player> with first active target, then second etc.
    let playersDied = 0; // To check if a player died this round to type it out.

    /* Get random players for the event */
    if ( (event.targets > playerList.length) && event.targets !== 'all' ) { startGameRound(); return; } // If there are more targets than active players, ignore and restart the game loop.

    if ( event.targets !== 'all' ) {
      for ( let i = 0; i < event.targets; i++ ) {
        let player = randomFrom(playerList);
  
        while ( eventPlayers.indexOf(player) !== -1 ) {
          player = randomFrom(playerList);
        }
  
        eventPlayers.push(player);
      }
    } else {
      /* Copy array as temporary players and effected so they won't mirror the real playerList which means they won't be removed the same round and can be read */
      let tempPlayers = [];
      let tempEffected = [];

      playerList.forEach((player, idx) => {
        tempPlayers.push(player);
        tempEffected.push(idx);
      })
      eventPlayers = tempPlayers;
      event.effectedTargets = tempEffected;
    }

    /* Pushing the playerList index/ices of the targeted player(s) so we don't have to do tedious index checks when updating later. */
    for ( let i = 0; i < event.effectedTargets.length; i++ ) {
      eventTargetIdxs.push(playerList.indexOf(eventPlayers[event.effectedTargets[i]])); // 
    } 

    /* Update health for effected targets and remove dead players */
    for ( let i = 0; i < eventTargetIdxs.length; i++ ) {
      let currentTarget = playerList[eventTargetIdxs[i - playersDied]]; // If a player dies the array gets smaller and therefore we need to adjust our index positioning.
      if ( event.targets !== 'all' ) {
        currentTarget.health += event.healthChange[i]; // Targeted player changes health by corresponding healthChange in the event.
      } else {
        currentTarget.health += event.healthChange[0] // When all players in the game lose the same amount of health which is the first healthChange value.
      }

      if ( currentTarget.health > 100 ) currentTarget.health = 100; // Health can't go beyond 100 which is max.        

      /* When a player dies move them from playerList -> deadPlayers and set how many players died this round to send R.I.P messages
          Very important; This means that eventPlayers will still be remaning and can be read to type out data while a player from playerList is removed. */
      if ( currentTarget.health <= 0 ) {
        currentTarget.health = 0;
        deadPlayers.push(...playerList.splice(playerList.indexOf(currentTarget), 1));
        playersDied++;
      }
    }

    /* Creating the event by replacing targets with correct names */
    let replacedEvent = event.description.trim().split(/[ ,.]+/).map(word => {
        if ( word === '<player>' ) {
          activeTarget++; // To be able to check first player[0] against effected (which can be player[2]) and then check second player[1] against effected and so on.

          /* If first player is an effected target type it out with underline */
          for ( let i = 0; i < event.effectedTargets.length; i++ ) {            
            if ( eventPlayers[activeTarget] === eventPlayers[event.effectedTargets[i]] ) return `__**${eventPlayers[activeTarget].name}**__`;
          }
          return `**${eventPlayers[activeTarget].name}**`; // If the first player is not a target
        } else {
          return word;
        }
    });

    /* Display different emojis based on players health */
    const health0 = bot.emojis.find(emoji => emoji.name === 'health0');
    const health5 = bot.emojis.find(emoji => emoji.name === 'health5');
    const health10 = bot.emojis.find(emoji => emoji.name === 'health10');
    const health15 = bot.emojis.find(emoji => emoji.name === 'health15');
    const health20 = bot.emojis.find(emoji => emoji.name === 'health20');
    const health25 = bot.emojis.find(emoji => emoji.name === 'health25');

    let roundMessage = `${replacedEvent.join(' ')}.`;
    let effectedTargetsMessages = [];

    for ( let i = 0; i < event.effectedTargets.length; i++ ) {
      let targetHealth = eventPlayers[event.effectedTargets[i]].health;
      let targetName = eventPlayers[event.effectedTargets[i]].name;

      /* Ticks for health to display a health bar based on 5's  */
      let healthTicks = Math.round(targetHealth / 5) * 5;
      if ( healthTicks === 0 && targetHealth > 0 ) healthTicks = 10;

      /* Health bar made up of 4 emojis with 25hp each to diplay HP */
      let healthBar = `${health25}${health25}${health25}${health25}`;
      if ( healthTicks > 100 ) { healthBar = `${health25}${health25}${health25}${health25}${eval('health' + (healthTicks - 100))}`; }
      if ( healthTicks >= 75 && healthTicks <= 100 ) { healthBar = `${health25}${health25}${health25}${eval('health' + (healthTicks - 75))}`; }
      if ( healthTicks >= 50 && healthTicks < 75 ) { healthBar = `${health25}${health25}${eval('health' + (healthTicks - 50))}${health0}`; }
      if ( healthTicks >= 25 && healthTicks < 50 ) { healthBar = `${health25}${eval('health' + (healthTicks - 25))}${health0}${health0}`; }
      if ( healthTicks >= 0 && healthTicks < 25 ) { healthBar = `${eval('health' + healthTicks)}${health0}${health0}${health0}`; }

      /* Push a message for each effected target so we can loop through and output all of them later */
      if ( event.targets !== 'all' ) {
        effectedTargetsMessages.push(`${targetName}  ${event.healthChange[i] > 0 ? '\u21E7' : '\u21E9'}*${Math.abs(event.healthChange[i])}HP*   ${healthBar}`);
      } else {
        effectedTargetsMessages.push(`${targetName}  ${event.healthChange[0] > 0 ? '\u21E7' : '\u21E9'}*${Math.abs(event.healthChange[0])}HP*   ${healthBar}`);
      }
    }
    
    /* Output event and effected players */
    message.channel.send(roundMessage);
    effectedTargetsMessages.forEach(msg => {
      message.channel.send(`${msg}`);
    });

    /* If a player died, output their embed as R.I.P message */
    if ( playersDied > 0 ) {
      for ( let i = 0; i < playersDied; i++ ) {
        message.channel.send(
          new Discord.RichEmbed()
            .setColor('#d82d2d')
            .setAuthor(deadPlayers.slice(-playersDied)[i].name)
            .setThumbnail(deadPlayers.slice(-playersDied)[i].url)
            .setTitle(deadPlayers.slice(-playersDied)[i].title)
            .setDescription('R.I.P')
        );
      }
    }

    /* If everyone dies */
    if ( playerList.length <= 0 ) {
      gameStatus.started = false;
      playerList.length = 0;
      deadPlayers.length = 0;
      return message.channel.send('**Looks like there were no winners this round!**');
    }

    /* If 1 player is left standing as the winner */
    if ( playerList.length === 1 ) {
      gameStatus.started = false;
      let winnerEmbed = new Discord.RichEmbed()
                          .setColor('#3bd82d')
                          .setAuthor(playerList[0].name)
                          .setThumbnail(playerList[0].url)
                          .setTitle(playerList[0].title)
                          .setDescription(playerList[0].health + ' HP')
                          .setFooter('WINNER');
      playerList.length = 0;
      deadPlayers.length = 0;
      return message.channel.send(winnerEmbed);        
    }

    setTimeout(startGameRound, 6000); // Run itself every 6 serconds.
    return message.channel.send('_ _'); // Outputs an empty line in Discord for some reason.
  }

  startGameRound(); // Initial start of the game round.
}