module.exports = ( message, playerList, titles, randomUniqueFrom, addPlayer ) => {
  if ( playerList.filter(player => player.id === message.author.id).length > 0 ) {
    return message.channel.send(`Looks like you have already entered the game ${message.author}!`).then(msg => msg.delete(5000))
  }

  let title = randomUniqueFrom(titles, playerList.map(player => player.title));
  
  addPlayer(message.author.id, message.member.displayName, title, message.author.displayAvatarURL);
  return message.channel.send(`${message.author} has entered the game!`).then(msg => msg.delete(7000));
}