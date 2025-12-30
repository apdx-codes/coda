use anchor_lang::prelude::*;

declare_id!("CounterProgram11111111111111111111111111111");

#[program]
pub mod counter_program {
    use super::*;

    /// Initialize a new counter account
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        counter.bump = *ctx.bumps.get("counter").unwrap();
        
        msg!("Counter initialized with authority: {}", counter.authority);
        Ok(())
    }

    /// Increment the counter
    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        
        require!(
            counter.count < u64::MAX,
            CounterError::Overflow
        );
        
        counter.count = counter.count.checked_add(1).unwrap();
        msg!("Counter incremented to: {}", counter.count);
        
        Ok(())
    }

    /// Decrement the counter
    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        
        require!(
            counter.count > 0,
            CounterError::Underflow
        );
        
        counter.count = counter.count.checked_sub(1).unwrap();
        msg!("Counter decremented to: {}", counter.count);
        
        Ok(())
    }

    /// Reset the counter to zero
    pub fn reset(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Counter reset to 0");
        
        Ok(())
    }

    /// Update the authority
    pub fn update_authority(
        ctx: Context<UpdateAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        let old_authority = counter.authority;
        counter.authority = new_authority;
        
        msg!("Authority updated from {} to {}", old_authority, new_authority);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump = counter.bump,
        has_one = authority @ CounterError::Unauthorized
    )]
    pub counter: Account<'info, Counter>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump = counter.bump,
        has_one = authority @ CounterError::Unauthorized
    )]
    pub counter: Account<'info, Counter>,
    
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    /// The authority that can modify this counter
    pub authority: Pubkey,
    /// The current count
    pub count: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

#[error_code]
pub enum CounterError {
    #[msg("Unauthorized: Only the authority can perform this action")]
    Unauthorized,
    
    #[msg("Overflow: Counter has reached maximum value")]
    Overflow,
    
    #[msg("Underflow: Counter cannot go below zero")]
    Underflow,
}

