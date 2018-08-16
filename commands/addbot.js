const fetch = require('node-fetch');

module.exports = ( message, playerList, titles, randomFrom, addPlayer ) => {
  let id = 1;
  let name = '';
  let health = 100;
  let title = randomFrom(titles);
  let avatar = '';

  while ( playerList.map(player => ( player.id )).includes(id) ) {
    id = id + 1;
  }

  fetch('https://randomuser.me/api/')
    .then(response => response.json())
    .then(user => {
      name = user.results[0].name.first.charAt(0).toUpperCase() + user.results[0].name.first.slice(1); // First name with capitalized letter.
      avatar = user.results[0].picture.medium;
      return;
    })
    .then(() => {
      addPlayer(id, name, title, avatar);
      return message.channel.send(`Bot ${name} has entered the game!`);
    })
    .catch(error => {
      console.log(`Unable to fetch user ${error}`);
    })
}