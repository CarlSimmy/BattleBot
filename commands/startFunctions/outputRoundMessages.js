module.exports = ( roundMessage, effectedTargetsMessages, message, Discord, playersDied, deadPlayers, playerList, changeGameStatus, clearPlayerLists ) => {
  /* Every round message for each target effected */
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
    changeGameStatus();
    clearPlayerLists();
    return message.channel.send('**Looks like there were no winners this round!**');
  }

  /* If 1 player is left standing as the winner */
  if ( playerList.length === 1 ) {
    let winnerEmbed = new Discord.RichEmbed()
                        .setColor('#3bd82d')
                        .setAuthor(playerList[0].name)
                        .setThumbnail(playerList[0].url)
                        .setTitle(playerList[0].title)
                        .setDescription(playerList[0].health + ' HP')
                        .setFooter('WINNER');
    changeGameStatus();                      
    clearPlayerLists();
    return message.channel.send(winnerEmbed);        
  }
}