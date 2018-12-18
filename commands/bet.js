module.exports = ( message, args, playerList, stats, fs ) => {
  const placeBet = (author, amount, betPlayer, betPlacer) => {
    message.channel.send(`${author} just placed a bet worth ${amount} coins on **${betPlayer.name}**, fingers crossed! :money_with_wings:`).then(msg => msg.delete(5000));

    stats[betPlacer].coins -= amount;

    let betPlacerIdx = betPlayer.placedBets.findIndex(bet => bet.player.id === author.id); // Find the index of betting player in the list of bets.

    if ( betPlacerIdx !== -1 ) { // If a player bets more than once on the same person, just sum it up instead of pushing a new bet.
      betPlayer.placedBets[betPlacerIdx].amount += amount;
      betPlayer.placedBets[betPlacerIdx].earnings += Math.round(amount * (playerList.length * 0.6));
    } else {
      betPlayer.placedBets.push({player: message.author, amount: amount, earnings: Math.round(amount * (playerList.length * 0.6))}); // More players = higher wins.
    }      
    
    fs.writeFile('./lists/stats.json', JSON.stringify(stats), err => {
      err && console.log(err);
    });
  }

  const betPlacer = message.author.id;
  const betNumber = parseInt(args[0]);
  const betAmount = args[1];
  const betPlayer = playerList[betNumber - 1] // betNumber is typed out as 1, 2, 3 instead of 0, 1, 2, need to -1

  if ( !stats[betPlacer] ) { stats[betPlacer] = { wins: 0 }; }
  if ( stats[betPlacer].coins == null ) {
    message.channel.send(`Looks like your first time betting ${message.author}. Have some coins to get started! (+100 coins)`).then(msg => msg.delete(7000));
    stats[betPlacer].coins = 100;

    fs.writeFile('./lists/stats.json', JSON.stringify(stats), err => {
      err && console.log(err);
    });
  };

  if ( playerList.length <= 2 && playerList.find(player => player.id === betPlacer) ) {
    message.channel.send(`Sorry ${message.author}, you can't place a bet when there's only you and another player fighting.`).then(msg => msg.delete(7000));
  } else if ( !betPlayer ) {
    message.channel.send(`Please select a valid player to bet on ${message.author}.`).then(msg => msg.delete(7000));
  } else if ( betAmount === 'all' && stats[betPlacer].coins > 0 ) {
    let totalAmount = stats[betPlacer].coins;
    placeBet(message.author, totalAmount, betPlayer, betPlacer);
  } else if ( stats[betPlacer].coins < parseInt(betAmount) || stats[betPlacer].coins <= 0 ) {
    message.channel.send(`Telling lies ${message.author}? You don't have enough coins for such a big bet!`).then(msg => msg.delete(7000));
  } else if ( !Number.isInteger(parseInt(betAmount)) || parseInt(betAmount) <= 0 ) {
    message.channel.send(`${message.author}, please enter a valid integer number above 0 to place a bet.`).then(msg => msg.delete(7000));
  } else {
    placeBet(message.author, parseInt(betAmount), betPlayer, betPlacer);
  }
}