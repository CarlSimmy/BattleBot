module.exports = {
  run: ( message, playerList, titles, randomFrom, addPlayer ) => {
    if ( playerList.filter(player => player.id === message.author.id).length > 0 ) {
      return message.channel.send(`Looks like you have already entered the game ${message.author}!`)
    }

    let uniqueTitle = randomFrom(titles);
    let uniqueTitleIdx = titles.indexOf(uniqueTitle);

    /* While title already exists, try next title in array */
    while ( playerList.map(player => ( player.title )).includes(uniqueTitle) ) {
      uniqueTitle = titles[(uniqueTitleIdx + 1) % titles.length];
    }
    
    if ( !playerList.map(player => ( player.title )).includes(uniqueTitle) ) {
      addPlayer(message.author.id, message.member.displayName, uniqueTitle, message.author.displayAvatarURL);
      return message.channel.send(`${message.author} has entered the game!`);
    }
  }
};