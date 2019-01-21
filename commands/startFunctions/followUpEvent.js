module.exports = ( bot, Discord, message, randomUniqueFrom, event, roundMessage, playerList, eventTargetIdxs ) => {
  const newEvent = randomUniqueFrom(event.followUpEvents); // The new event.
  const eventPlayerId = playerList[eventTargetIdxs[0]].id; // The player which received the event.
  let chosenPlayer = playerList[Math.floor(Math.random() * playerList.length)]; // Random player if none is picked.
  
  message.channel.send('_ _');
  message.channel.send(roundMessage);

  let playerChoiceList = '**Choose which player to target** \n \n';
  playerList.forEach((player, idx) => {
    playerChoiceList += `__**${player.name}**__ - !use **${idx + 1}** \n \n`;
  })

  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#C5B358')
      .setDescription(playerChoiceList)
  );

  let isTargetChosen = false;

  /* Check for messages choosing target */
  bot.on('message', async message => {
    if ( message.author.bot || message.channel.type === 'dm' ) return;

    const args = message.content.slice(1).trim().split(/ +/g);
    let command = '';
    if ( message.content[0] === '!' ) {
      command = args.shift().toLowerCase();
    }

    let chosenPlayerNumber = parseInt(args[0]);

    if ( command === 'use' && message.author.id === eventPlayerId && chosenPlayerNumber > 0 && chosenPlayerNumber <= playerList.length && !isTargetChosen ) {          
      isTargetChosen = true;
      chosenPlayer = playerList[chosenPlayerNumber - 1];
      if ( chosenPlayer.id === eventPlayerId ) {
        message.channel.send(`${message.author} decides to target himself!`);            
      } else {
        message.channel.send(`${message.author} decides to target ${chosenPlayer.name}!`);
      }
    }
  });

  /* If it's a bot player, output random target */
  if ( eventPlayerId < 100 && !isTargetChosen ) {
    setTimeout(() => { // Need to delay to prevent it from being too spammy and unreadable.
      isTargetChosen = true;
      if ( chosenPlayer.id === eventPlayerId ) {
        message.channel.send(`${playerList[eventTargetIdxs[0]].name} decides to target himself!`);            
      } else {
        message.channel.send(`${playerList[eventTargetIdxs[0]].name} decides to target ${chosenPlayer.name}!`);
      }
    }, 3000);
  }

  return new Promise(resolve => setTimeout(() => resolve({event: newEvent, player: chosenPlayer}), 17000)); // Return the chosen player after 17s.
}