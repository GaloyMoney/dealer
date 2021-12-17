const Balance = ({ balance }: { balance: number }) => {
  return (
    <div className="balance">
      <div className="title">Current Balance</div>
      <div className="value">
        <div className="primary">$0</div>
        <div className="secondary">({balance} sats)</div>
      </div>
    </div>
  )
}

export default Balance
