module.exports = ( message, playerList, betStatus, Discord ) => {
 
  /* Close betting and output list of bets */
  const closeBets = () => {
    betStatus.open = false;
    let betTable = '**Bets placed for this round:** \n \n';
    let areBetsPlaced = false; // To check if there are actually any placed bets.

    playerList.forEach(player => {
      if ( player.placedBets.length > 0 ) {
        if ( !areBetsPlaced ) areBetsPlaced = true;
        betTable += `__**${player.name}**__ \n`;
        player.placedBets.forEach(bet=> {
          betTable += `${bet.player} bet: **${bet.amount}** coins \n \n`;
        })
      }
    })
    
    areBetsPlaced ? 
      message.channel.send(
        new Discord.RichEmbed()
          .setColor('#C5B358')
          .setThumbnail('https://images-na.ssl-images-amazon.com/images/I/417UqXCEJ5L.png')
          .setDescription(betTable)
      )
      : 
      message.channel.send(
        new Discord.RichEmbed()
          .setColor('#C5B358')
          .setTitle('No bets placed this round')
      );
  }

  let betMessage = '**Place your bets now!** \n \n'; // Add to one message instead of outputting multiple causing Discord to lag.
  playerList.forEach((player, idx) => {
    betMessage += `__**${player.name}**__ - !bet **${idx + 1}** [coins] \n \n`;
  })

  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#C5B358')
      .setThumbnail('https://i.imgur.com/wDyj0kd.png')
      .setDescription(betMessage)
  );

  setTimeout(closeBets, 25000); // Output list of bets and close betting efter 25s before each round.
}