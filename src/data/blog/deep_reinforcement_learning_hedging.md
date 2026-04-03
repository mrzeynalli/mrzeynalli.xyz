---
author: Elvin Zeynalli
pubDatetime: 2026-04-03T12:00:00+03:00
title: "Deep Reinfocrement Learning for Hedging"
postSlug: deep-reinforcement-learning-hedging
featured: false
draft: false
tags:
  - Quant Trading
  - Hedging
  - Risk Management
  - Reinforcement Learning
  - Deep Learning
description: "An overview of deep hedging, focusing on how hedging can be framed as a risk-aware sequential decision problem under transaction costs, liquidity constraints, and convex risk measures."
---

**Project description**
- *Primary paper:* Buehler, Gonon, Teichmann, and Wood (2019), *Deep Hedging*
- *Domain:* Quantitative finance, derivatives hedging, risk management
- *Project type:* Research note / explanatory article
- *Core ideas:* Deep hedging, convex risk measures, sequential decision-making, implicit MDP structure

---

This article explains **deep hedging** through the framework introduced in *Deep Hedging* by Buehler et al. (2019). The central idea is not simply that neural networks are used for hedging. The more important contribution is that hedging is reformulated as a **risk-aware sequential decision problem** under realistic market frictions such as transaction costs, liquidity restrictions, and position constraints.

That shift matters because classical hedging theory is usually developed in an idealized setting. In practice, traders do not hedge in frictionless markets, and they do not care only about replication error in a perfect model. They care about trading costs, inventory, tail losses, capital usage, and whether a hedging policy still works out-of-sample. Deep hedging addresses that more realistic problem directly.

## Why Classical Hedging Is Not Enough

In traditional derivatives theory, the benchmark approach is often simple: choose a pricing model, compute the hedge, and rebalance accordingly. In a frictionless and complete market, that is elegant and powerful.

But real markets are not frictionless:

- trading costs are non-zero,
- liquidity can be limited,
- some instruments cannot be traded at all times,
- risk limits matter,
- and a desk may care more about avoiding extreme losses than about minimizing average error.

Deep hedging begins where classical hedging becomes less realistic. Instead of asking for the perfect hedge in an ideal model, it asks:

**What trading policy gives the best risk-adjusted outcome in a realistic trading environment?**

## The Core Setup

The paper models a trader who must hedge a liability \( Z \) using a set of tradable hedging instruments. The final portfolio value is written as

$$
PL_T = -Z + p_0 + (\delta \cdot S)_T - C_T(\delta)
$$

where:

- \( Z \) is the payoff that needs to be hedged,
- \( p_0 \) is the initial premium or cash injection,
- \( (\delta \cdot S)_T \) is the cumulative trading gain or loss,
- \( C_T(\delta) \) is the total trading cost of the strategy.

This formula is important because it shows that the problem is not just about tracking a payoff. It is about trading a hedge over time, while paying for each adjustment. That is much closer to how hedging works in practice.

## The Role of Convex Risk Measures

One of the most important ideas in the paper is the use of a **convex risk measure**.

Instead of optimizing only expected profit, the trader evaluates the terminal outcome through a risk function \( \rho(\cdot) \). Intuitively, a convex risk measure has three desirable properties:

- if one payoff is always better than another, it should be considered less risky,
- adding cash should reduce risk in a transparent way,
- diversification should not increase risk.

This is a natural language for hedging. A hedger does not usually want to maximize raw average P\&L. A hedger wants to control bad outcomes, especially extreme ones.

### Optimized Certainty Equivalent

The paper gives special attention to **optimized certainty equivalents (OCE)**, which can be written as

$$
\rho(X) = \inf_{w} \left\{ w + \mathbb{E}\left[\ell(-X-w)\right] \right\}
$$

This looks technical, but the idea is simple. The question is:

**How much cash buffer \( w \) would be needed so that the remaining risky payoff becomes acceptable under a chosen loss function \( \ell \)?**

That is why the term *certainty equivalent* is useful. It converts an uncertain payoff into a cash-like risk-adjusted quantity.

### Expected Shortfall / CVaR

Another important example used in the paper is **average value at risk**, also known as **expected shortfall** or **CVaR**.

In plain English, this focuses on the bad tail of the distribution. It does not just ask, "What happens on average?" It asks, "What do losses look like in the worst cases?" For hedging, that is often far more relevant.

### Entropic Risk and Utility

The paper also connects deep hedging to **entropic risk** and **exponential utility indifference pricing**. In that setting, risk is measured through

$$
\rho(X) = \frac{1}{\lambda}\log \mathbb{E}\left[e^{-\lambda X}\right]
$$

where \( \lambda \) reflects risk aversion.

Conceptually, this means the trader is not valuing a payoff in a risk-neutral way. Instead, the trader prices it according to how it affects utility after hedging. This leads to the idea of an **indifference price**: the price at which the trader is equally satisfied with selling and hedging the claim, or not entering the trade at all.

This is one of the strongest ideas in the paper because it turns pricing and hedging into one unified risk-management problem.

## How Deep Hedging Actually Works

Once the market simulator, payoff, trading costs, and risk measure are specified, the strategy is parameterized by neural networks.

At each hedging date, the network receives market information and outputs the new hedge. In the paper, the trading rule is written in a semi-recurrent form:

$$
\delta_k = F_k(I_0,\dots,I_k,\delta_{k-1})
$$

In plain language, this means:

- the agent looks at the information available up to time \( k \),
- it also remembers its previous holdings,
- and then decides the next hedge position.

That previous-position term matters a lot. If rebalancing were free, memory would be less important. But once trading costs exist, changing positions becomes expensive, so the current decision depends on where the trader already is.

The training loop is conceptually straightforward:

1. Simulate many market scenarios.
2. Let the network choose hedges along each path.
3. Compute terminal P\&L net of trading costs.
4. Evaluate the result through a convex risk measure.
5. Update the network parameters to improve the risk-adjusted outcome.

So the network is not learning a price formula. It is learning a **policy**.

## Why the Problem Is Implicitly an MDP

This is one of the most important points in the paper.

In **Remark 2**, the framework is written in the language of mathematical finance, but it can be translated into reinforcement learning by interpreting:

- market information as **states**,
- trading strategies as **actions**,
- portfolio value as **reward**,
- and the convex risk measure as a **risk-adjusted return criterion**.

This is effectively an **MDP** in finance notation.

Here is the mapping more explicitly:

- **State:** the information available at time \( k \), such as prices, volatility-related variables, signals, and current inventory.
- **Action:** the new hedge decision, meaning how many units of each hedging instrument to hold.
- **Transition:** the market evolves to the next time step according to the scenario generator, and the inventory updates according to the chosen action.
- **Reward:** the portfolio's change in value, including trading gains, losses, and costs.
- **Objective:** not just maximize cumulative reward, but optimize a risk-adjusted terminal objective.

This is the cleanest way to understand deep hedging.

It is not merely "using deep learning in finance." It is solving a sequential control problem under uncertainty, where the agent repeatedly updates a hedge while facing realistic frictions.

### Why It Is Not a Textbook RL Problem

At the same time, it is not a completely standard RL setup.

In textbook RL, the objective is often the expected discounted sum of rewards. Here, the paper allows for a **non-linear evaluation of final outcomes** through a convex risk measure. That means the objective is not purely about average reward accumulation. It is about the quality of the full terminal distribution.

This is exactly why the risk-measure layer matters. Deep hedging is MDP-like in structure, but more risk-sensitive than the usual introductory RL formulation.

## Why the Semi-Recurrent Structure Makes Sense

The paper uses a semi-recurrent architecture because the strategy should depend not only on market information, but also on the previous hedge position.

This is economically intuitive.

If two traders see the same market state today but one is already heavily long and the other is nearly flat, the best next action may differ because their rebalancing costs differ. In other words, **inventory is part of the state**.

That is one reason the MDP interpretation is so natural: the system has memory through positions, and the action affects both future exposure and future cost.

## What the Paper Shows Empirically

The paper does not stop at theory. It also shows several practical experiments.

### 1. Learning the benchmark hedge in a Heston model

In a frictionless Heston setting, the deep hedging strategy is able to learn a hedge close to the benchmark model hedge. This is important because it shows the method can recover familiar solutions when the environment is favorable.

So deep hedging is not useful only when classical theory fails. It can also learn known benchmark behavior from simulated scenarios.

### 2. Transaction costs change the hedge meaningfully

When proportional transaction costs are introduced, the optimal hedge changes and the pricing problem changes with it. This is where deep hedging becomes more interesting than standard delta-hedging intuition.

The strategy learns to trade less aggressively when rebalancing is costly, and the paper studies how this affects utility-indifference prices.

### 3. The method scales to higher dimensions

A major attraction of the framework is scalability. The paper argues that the computational burden depends more on the number of hedging instruments than on the size of the liability portfolio itself.

That makes the approach appealing in settings where exact dynamic programming or PDE-based methods become impractical.

### 4. It performs well on the S\&P500 experiment

The paper also includes a more practical experiment on the S\&P500 index. In one setup, the deep hedging strategy achieves roughly **20% lower mean squared hedging loss** than a daily recalibrated Black-Scholes benchmark at the same price level. The broader message is that a scenario-based, risk-aware hedge can outperform a strong classical baseline when the environment is more realistic.

## The Main Contribution

The core innovation of the paper is not simply "use neural networks for hedging."

The deeper contribution is this:

**Hedging is reframed as learning a trading policy under realistic constraints, instead of deriving a formula inside an idealized model.**

That is a major conceptual shift.

What deep hedging offers is:

- a way to incorporate transaction costs directly into the optimization,
- a way to optimize tail-sensitive objectives rather than only average outcomes,
- a flexible policy representation through neural networks,
- and a framework that feels much closer to real decision-making on a trading desk.

## A Limitation That Should Not Be Ignored

The biggest practical limitation is that deep hedging is only as good as the world it is trained on.

The policy may be model-agnostic in form, but it is still trained on scenarios generated from some assumed data-generating process, whether that comes from a Heston model, a GARCH-style econometric model, or historical sampling. If that scenario generator is poor, the hedge may learn the wrong lessons.

So deep hedging does not eliminate modeling risk. It relocates it.

Instead of placing all trust in a pricing formula, the framework places heavy trust in:

- the scenario generator,
- the chosen risk measure,
- the feature set,
- and the training design.

That does not make the framework weaker, but it does mean that "deep" does not automatically mean "correct."

## Closing Note

The main takeaway from *Deep Hedging* is that it provides a strong bridge between **quantitative finance**, **reinforcement learning**, and **risk management**.

For a non-technical reader, the simplest summary is this:

Deep hedging treats hedging as a sequence of decisions. At each step, a model observes the market, updates the hedge, pays the cost of trading, and aims to produce the best risk-adjusted final outcome. In the paper's own terms, this is expressed in mathematical finance language, but in substance it is very close to an MDP with a risk-sensitive objective.

That is what makes the paper so interesting. It is not just about neural networks. It is about redefining what the hedging problem is.
