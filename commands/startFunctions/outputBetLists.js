module.exports = ( message, playerList, betStatus ) => {
  /* Close betting and output list of bets */
  const closeBets = () => {
    betStatus.open = false;
    let betTable = '==== Bets placed for this round ==== \n \n';
    let areBetsPlaced = false; // To check if there are actually any placed bets.

    playerList.forEach(player => {
      if ( player.placedBets.length > 0 ) {
        if ( !areBetsPlaced ) areBetsPlaced = true;
        betTable += `-- **${player.name}** -- \n`;
        player.placedBets.forEach((bet, idx) => {
          betTable += `${bet.player} bet: **${bet.amount}** coins \n`;
          if ( idx === player.placedBets.length - 1 ) betTable += '\n'; // Add extra new line to last bet for better layout spacing.
        })
      }
    })
    
    areBetsPlaced ? message.channel.send(betTable) : message.channel.send('==== No bets placed this round! ====');
    message.channel.send('_ _');
  }
  
  let betMessage = 'Place your bets now! \n \n'; // Add to one message instead of outputting multiple causing Discord to lag.
  playerList.forEach((player, idx) => {
    betMessage += `**${player.name}** - !bet **${idx + 1}** [coins] \n`;
  })
  message.channel.send(betMessage);
  message.channel.send('_ _');

  setTimeout(closeBets, 25000); // Output list of bets and close betting efter 25s before each round.
}