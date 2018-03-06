module.exports = {
  run: ( message, playerList, deadPlayers ) => {
    playerList.length = 0;
    deadPlayers.length = 0;
    return message.channel.send('All entrants have been removed for the game.');
  }
};