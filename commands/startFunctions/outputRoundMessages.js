module.exports = ( roundMessage, effectedTargetsMessages, message, Discord, playersDied, deadPlayers, playerList, changeGameStatus, updatePlayerList, updatePrevPlayerList ) => {
  /* Every round message for each target effected */
  message.channel.send('_ _');
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
          .setDescription('R.I.P' + '\n' + 'Round wins: ' + deadPlayers.slice(-playersDied)[i].wins)
      );
    }
  }

  /* If everyone dies */
  if ( playerList.length <= 0 ) {
    const highestWins = Math.max(...deadPlayers.map(player => player.wins));
    const highestWinsPlayer = deadPlayers.find(player => player.wins === highestWins);
    
    changeGameStatus(highestWinsPlayer);
    return message.channel.send('**Looks like there were no winners this round!**');
  }

  /* If 1 player is left standing as the winner */
  if ( playerList.length === 1 ) {
    updatePlayerList(playerList[0]); // Updating player list to output correct wins this round.
    updatePrevPlayerList(playerList[0].id);

    let winnerEmbed = new Discord.RichEmbed()
                        .setColor('#3bd82d')
                        .setAuthor(playerList[0].name)
                        .setThumbnail(playerList[0].url)
                        .setTitle(playerList[0].title)
                        .setDescription(playerList[0].health + ' HP' + '\n' + 'Round wins: ' + playerList[0].wins)
                        .setFooter('WINNER');

    changeGameStatus(playerList[0]);
    return message.channel.send(winnerEmbed);
  }
}