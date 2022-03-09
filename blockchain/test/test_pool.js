const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');


var ERC20 = artifacts.require("../contracts/ERC20.sol");
var Pool = artifacts.require("../contracts/Pool.sol");

contract('Pool', function(accounts) {
    before(async () => {
        erc20instance = await ERC20.deployed();
        poolInstance = await Pool.deployed();
    });

    it('Test Get PTs', async() => {
        let getPT = await poolInstance.getPT({from:accounts[1], value: 1E18});
        truffleAssert.eventEmitted(getPT, "GetPT");
        let checkPT = await poolInstance.getTokenBalance.call(accounts[1]);
        assert.strictEqual(checkPT.toNumber(), 100, "PT not deployed correctly");
        
        let getPT2 = await poolInstance.getPT({from:accounts[2], value: 1E18});
        truffleAssert.eventEmitted(getPT2, "GetPT");
        let checkPT2 = await poolInstance.getTokenBalance.call(accounts[2]);
        assert.strictEqual(checkPT2.toNumber(), 100, "PT not deployed correctly");

    });

    it('Test Send Tokens', async() => {
        let sendToken = await poolInstance.sendTokens(50, {from:accounts[1]});
        truffleAssert.eventEmitted(sendToken, "TokenSent");

        let sendToken2 = await poolInstance.sendTokens(40, {from:accounts[2]});
        truffleAssert.eventEmitted(sendToken2, "TokenSent");

        let tpool = await poolInstance.getTotalPool.call();
        assert.strictEqual(tpool.toNumber(), 90, "TotalPool doesn't align");
    });

    it('Check Voter List length', async () => {
        let vlistlen = await poolInstance.getVoterListLength.call();
        assert.strictEqual(vlistlen.toNumber(), 2);
    });


    it('Test Voting', async() => {
        let vote_acct2 = await poolInstance.vote(accounts[2], {from: accounts[1]});
        truffleAssert.eventEmitted(vote_acct2, "Voted");

        let checkVote = await poolInstance.getVote.call(accounts[1]);
        assert.strictEqual(checkVote, accounts[2], "vote not working");

    });

    it('Test that voters cannot vote twice', async() => {
        await truffleAssert.reverts(poolInstance.vote(accounts[2], {from: accounts[1]}), "Can't vote twice!");
    })

    it('Check candidateVotes', async() => {
        let vres = await poolInstance.getcandidateVotes.call(accounts[2]);
        assert.strictEqual(vres.toNumber(), 50, "candidateVotes not working");
    })

    it('Ensure non-chairs cannot end vote', async() => {
        await truffleAssert.reverts(poolInstance.endVoting({from:accounts[1]}), "Only chairperson can end voting")
    })

    it('Test VoteWon', async() => {
        //Please work on this test
        let endVoting =  await poolInstance.endVoting({from:accounts[0]});
        truffleAssert.eventEmitted(endVoting, "VoteWon");

        let checkPT1 = await poolInstance.getTokenBalance.call(accounts[1]);
        let checkPT2 = await poolInstance.getTokenBalance.call(accounts[2]);
        
        assert.strictEqual(checkPT1.toNumber(), 50, "VoteWon not working");
        assert.strictEqual(checkPT2.toNumber(), 150, "VoteWon not working");
    });


    it('Test VoteDrawn', async() => {
        //Please work on this 

        // Step 1: Give everyone 100 PT
        let getPT1 = await poolInstance.getPT({from:accounts[3], value: 1E18});
        truffleAssert.eventEmitted(getPT1, "GetPT");
        let checkPT1 = await poolInstance.getTokenBalance.call(accounts[3]);
        assert.strictEqual(checkPT1.toNumber(), 100, "PT not deployed correctly");

        let getPT2 = await poolInstance.getPT({from:accounts[4], value: 1E18});
        truffleAssert.eventEmitted(getPT2, "GetPT");
        let checkPT2 = await poolInstance.getTokenBalance.call(accounts[4]);
        assert.strictEqual(checkPT2.toNumber(), 100, "PT not deployed correctly");

        let getPT3 = await poolInstance.getPT({from:accounts[5], value: 1E18});
        truffleAssert.eventEmitted(getPT3, "GetPT");
        let checkPT3 = await poolInstance.getTokenBalance.call(accounts[5]);
        assert.strictEqual(checkPT3.toNumber(), 100, "PT not deployed correctly");
        
        // Step 2: Get everyone to give 100 PT to Pool
        let sendToken1 = await poolInstance.sendTokens(100, {from:accounts[3]});
        truffleAssert.eventEmitted(sendToken1, "TokenSent");

        let sendToken2 = await poolInstance.sendTokens(100, {from:accounts[4]});
        truffleAssert.eventEmitted(sendToken2, "TokenSent");

        let sendToken3 = await poolInstance.sendTokens(100, {from:accounts[5]});
        truffleAssert.eventEmitted(sendToken3, "TokenSent");

        // Step 3: Verify Pool total
        let tpool = await poolInstance.getTotalPool.call();
        assert.strictEqual(tpool.toNumber(), 300, "TotalPool doesn't align");

        // Step 4: Get everyone to vote the next person
        let vote_acct1 = await poolInstance.vote(accounts[4], {from: accounts[3]});
        truffleAssert.eventEmitted(vote_acct1, "Voted");

        let checkVote1 = await poolInstance.getVote.call(accounts[3]);
        assert.strictEqual(checkVote1, accounts[4], "vote not working");

        let vote_acct2 = await poolInstance.vote(accounts[5], {from: accounts[4]});
        truffleAssert.eventEmitted(vote_acct2, "Voted");

        let checkVote2 = await poolInstance.getVote.call(accounts[4]);
        assert.strictEqual(checkVote2, accounts[5], "vote not working");

        let vote_acct3 = await poolInstance.vote(accounts[3], {from: accounts[5]});
        truffleAssert.eventEmitted(vote_acct3, "Voted");
        
        let checkVote3 = await poolInstance.getVote.call(accounts[5]);
        assert.strictEqual(checkVote3, accounts[3], "vote not working");

        // Step 5: Verify everyone get 100 votes
        let vres1 = await poolInstance.getcandidateVotes.call(accounts[3]);
        assert.strictEqual(vres1.toNumber(), 100, "candidateVotes not working");

        let vres2 = await poolInstance.getcandidateVotes.call(accounts[4]);
        assert.strictEqual(vres2.toNumber(), 100, "candidateVotes not working");

        let vres3 = await poolInstance.getcandidateVotes.call(accounts[5]);
        assert.strictEqual(vres3.toNumber(), 100, "candidateVotes not working");
        
        // Step 6: End Voting and check that everyone gets back their PT
        let endVoting =  await poolInstance.endVoting({from:accounts[0]});
        truffleAssert.eventEmitted(endVoting, "VoteDrawn");

        let postcheckPT1 = await poolInstance.getTokenBalance.call(accounts[3]);
        assert.strictEqual(postcheckPT1.toNumber(), 100, "VoteDrawn not working");

        let postcheckPT2 = await poolInstance.getTokenBalance.call(accounts[4]);
        assert.strictEqual(postcheckPT2.toNumber(), 100, "VoteDrawn not working");

        let postcheckPT3 = await poolInstance.getTokenBalance.call(accounts[5]);
        assert.strictEqual(postcheckPT3.toNumber(), 100, "VoteDrawn not working");
    })

    
});