module.exports = ( message, playerList, deadPlayers ) => {
  playerList.length = 0;
  deadPlayers.length = 0;
  return message.channel.send('All entrants have been removed for the game.').then(msg => msg.delete(5000));
}