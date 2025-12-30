use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("StakingProgram1111111111111111111111111111111");

#[program]
pub mod staking_program {
    use super::*;

    /// Initialize the staking pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        reward_rate: u64,
        lock_duration: i64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.reward_token = ctx.accounts.reward_token.key();
        pool.reward_rate = reward_rate;
        pool.lock_duration = lock_duration;
        pool.total_staked = 0;
        pool.bump = *ctx.bumps.get("pool").unwrap();

        msg!("Staking pool initialized with rate: {} per second", reward_rate);
        Ok(())
    }

    /// Stake tokens
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        let stake_account = &mut ctx.accounts.stake_account;
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        // Transfer tokens to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update stake account
        if stake_account.amount == 0 {
            stake_account.user = ctx.accounts.user.key();
            stake_account.pool = pool.key();
            stake_account.amount = amount;
            stake_account.staked_at = clock.unix_timestamp;
            stake_account.last_claim = clock.unix_timestamp;
            stake_account.bump = *ctx.bumps.get("stake_account").unwrap();
        } else {
            // Claim existing rewards before adding more stake
            let pending = calculate_rewards(
                stake_account.amount,
                pool.reward_rate,
                stake_account.last_claim,
                clock.unix_timestamp,
            )?;
            stake_account.unclaimed_rewards = stake_account
                .unclaimed_rewards
                .checked_add(pending)
                .unwrap();
            
            stake_account.amount = stake_account.amount.checked_add(amount).unwrap();
            stake_account.last_claim = clock.unix_timestamp;
        }

        pool.total_staked = pool.total_staked.checked_add(amount).unwrap();

        msg!("Staked {} tokens. Total: {}", amount, stake_account.amount);
        Ok(())
    }

    /// Unstake tokens
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        require!(amount > 0, StakingError::InvalidAmount);
        require!(amount <= stake_account.amount, StakingError::InsufficientStake);

        // Check lock duration
        let time_staked = clock.unix_timestamp - stake_account.staked_at;
        require!(
            time_staked >= pool.lock_duration,
            StakingError::StillLocked
        );

        // Calculate and save pending rewards
        let pending = calculate_rewards(
            stake_account.amount,
            pool.reward_rate,
            stake_account.last_claim,
            clock.unix_timestamp,
        )?;
        stake_account.unclaimed_rewards = stake_account
            .unclaimed_rewards
            .checked_add(pending)
            .unwrap();

        // Transfer tokens back to user
        let seeds = &[
            b"pool",
            pool.authority.as_ref(),
            &[pool.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        // Update balances
        stake_account.amount = stake_account.amount.checked_sub(amount).unwrap();
        stake_account.last_claim = clock.unix_timestamp;
        pool.total_staked = pool.total_staked.checked_sub(amount).unwrap();

        msg!("Unstaked {} tokens. Remaining: {}", amount, stake_account.amount);
        Ok(())
    }

    /// Claim rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let pool = &ctx.accounts.pool;
        let clock = Clock::get()?;

        // Calculate total rewards
        let pending = calculate_rewards(
            stake_account.amount,
            pool.reward_rate,
            stake_account.last_claim,
            clock.unix_timestamp,
        )?;
        
        let total_rewards = stake_account
            .unclaimed_rewards
            .checked_add(pending)
            .unwrap();

        require!(total_rewards > 0, StakingError::NoRewards);

        // Transfer rewards
        let seeds = &[
            b"pool",
            pool.authority.as_ref(),
            &[pool.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_reward_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, total_rewards)?;

        // Reset rewards
        stake_account.unclaimed_rewards = 0;
        stake_account.last_claim = clock.unix_timestamp;

        msg!("Claimed {} rewards", total_rewards);
        Ok(())
    }
}

fn calculate_rewards(
    staked_amount: u64,
    reward_rate: u64,
    last_claim: i64,
    current_time: i64,
) -> Result<u64> {
    let time_elapsed = current_time
        .checked_sub(last_claim)
        .ok_or(StakingError::InvalidCalculation)? as u64;
    
    let rewards = staked_amount
        .checked_mul(reward_rate)
        .and_then(|v| v.checked_mul(time_elapsed))
        .and_then(|v| v.checked_div(1_000_000))
        .ok_or(StakingError::InvalidCalculation)?;
    
    Ok(rewards)
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StakingPool::INIT_SPACE,
        seeds = [b"pool", authority.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    pub reward_token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [b"stake", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(
        mut,
        seeds = [b"stake", pool.key().as_ref(), user.key().as_ref()],
        bump = stake_account.bump,
        has_one = user
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [b"stake", pool.key().as_ref(), user.key().as_ref()],
        bump = stake_account.bump,
        has_one = user
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    pub pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct StakingPool {
    pub authority: Pubkey,
    pub reward_token: Pubkey,
    pub reward_rate: u64,
    pub lock_duration: i64,
    pub total_staked: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub last_claim: i64,
    pub unclaimed_rewards: u64,
    pub bump: u8,
}

#[error_code]
pub enum StakingError {
    #[msg("Invalid amount specified")]
    InvalidAmount,
    
    #[msg("Insufficient stake balance")]
    InsufficientStake,
    
    #[msg("Tokens are still locked")]
    StillLocked,
    
    #[msg("No rewards to claim")]
    NoRewards,
    
    #[msg("Invalid calculation")]
    InvalidCalculation,
}

