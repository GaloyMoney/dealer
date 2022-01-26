# Profit and Loss

## Something

### The Basis

The *basis* in a hedging situation is defined as follow:

    Basis = Spot price of asset to be hedged - Futures price of contract used to hedge

If both assets are the same, like in our case (versus a proxy asset underlying the futures), then the basis should be zero at expiry. 
Prior to that, the basis can be positive or negative.

It is important to note that even if both prices are related, they do not necessarily change by the same amount so can converge or diverge. Leading to the basis changing thru out the life of the contract while tending to zero at expiry.

Also important is whether the asset price at expiry is higher or lower than at trade time.

This leads to four cases

| case | basis | asset price |
| --- | ----- | ----------- |
| 1 | negative | lower |
| 2 | negative | higher |
| 3 | positive | lower |
| 4 | positive | higher |

![Basis Cases](./assets/basis_cases_.jpg)
<!-- 
![Case 1](./assets/basis_case_01.jpg)

![Case 2](./assets/basis_case_02.jpg)

![Case 3](./assets/basis_case_03.jpg)

![Case 4](./assets/basis_case_04.jpg) -->

For the purpose of the pnl analysis let's define these:

- S1 : spot price at time t1
- S2 : spot price at time t2
- F1 : futures price at time t1
- F2 : futures price at time t2
- b1 : basis at time t1
- b2 : basis at time t2.

By definition:

- b1 = S1 - F1
- b2 = S2 - F2

Assuming we own the asset from t1 and liquidate it at t2,
it follows that the hedge position is then taken at t1 and closed out at t2 along with the exposure to the asset.
So the pnl is effectively the difference in futures prices plus the liquidation of the asset at t2. 
Given that the hedge is a short position, the Pnl is:

- Pnl = S2 + F1 - F2


#### Hedge effectiveness

If we want to understand why there's a discrepancy between both position, we have to realize that we are dealing with two different markets driven by different forces/processes.

So a change in price ΔS on the spot market does not generates the same price change ΔD on the derivative's market.

The Derivative's market will eventually follow, as else if it diverged it would create an arbitrage opportunity which market participants would take advantage of and cause the markets to re-converge.

If we plot ΔS vs ΔD, we can see the trend.

Using linear regression we can plot the trending line which it slope gives us the optimal hedging ratio while the R^2 gives us the hedge effectiveness, i.e. the portion of variance that is eliminated by the hedge.

In comparison we are using a hedging ratio of 1, i.e. the blue 45 degree line, which is not optimal and eliminated less of the variance.

So an improved strategy would be to calculate and use that minimum variance hedge ratio instead of the current constant 1.

##### Regression of change in spot price against change in derivative's price
![Regression of change in spot price against change in derivative's price](./assets/hedge_ratio.jpg)

