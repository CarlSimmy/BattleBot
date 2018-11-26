module.exports = ( message, gameStatus, roundWinner, stats, prevPlayerList, fs, winsNeeded, initiateRematch, startGameRound ) => {
  if ( gameStatus.started === false ) {
    /* Rewarding players with coins for winning the round */
    if ( roundWinner.id > 100 ) { // No coins for bot players.
      if ( stats[roundWinner.id].coins == null ) { stats[roundWinner.id].coins = 0 }
      const winnerPrice = Math.round(50 * (prevPlayerList.length * 0.65))
      stats[roundWinner.id].coins += winnerPrice;
      message.channel.send(`Congratulations **${roundWinner.name}**, you earned **${winnerPrice}** coins by winning! :money_mouth:`);
    }

    /* Rewarding betting players with coins if they guessed correctly */
    if ( roundWinner.placedBets.length > 0 ) {
      roundWinner.placedBets.forEach(bet => {
        stats[bet.player.id].coins += bet.earnings;
        message.channel.send(`Nice betting ${bet.player}, you just cashed in **${bet.earnings}** coins! :moneybag:`);
      })
    }

    fs.writeFile('./stats.json', JSON.stringify(stats), err => {
      err && console.log(err);
    });

    if ( roundWinner.wins < winsNeeded ) {
      return initiateRematch();
    } else {
      return message.channel.send(`Bow down to our new champion **${roundWinner.name}** :crown:!    :bow:`);
    }
  }

  message.channel.send('_ _'); // Outputs an empty line in Discord for some reason, this makes the messages easier to read.
  return setTimeout(startGameRound, 6000); // Run itself every 6 seconds.
}