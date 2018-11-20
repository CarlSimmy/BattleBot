module.exports = ( Discord, message, playerList ) => {
  if ( playerList.length > 0 ) {
    message.channel.send('Players alive:')
    playerList.forEach(player => {
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor('#3bd82d')
          .setAuthor(player.name)
          .setThumbnail(player.url)
          .setTitle(player.title)
          .setDescription(player.health + ' HP')
      );
    })
  } else {
    return message.channel.send('No players have entered the game.').then(msg => msg.delete(7000));
  }
}