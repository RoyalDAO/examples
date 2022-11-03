# <img src="https://github.com/RoyalDAO/royaldao-contracts/blob/RELEASE/assets/images/RoyalDAO_Logo.png" alt="RoyalDao" height="80px">

Collection of Examples using the Senate/Chancellor pattern

## Overview

### Who Am I?

I am [Vin Rodrigues](https://github.com/rodriguesmvinicius), Co-founder of [QueenEDAO](https://queene.wtf/), along with other 3 people (see more at [QueenE Repo](https://github.com/rodriguesmvinicius/QueenE_Contracts/blob/HEAD/README.md)), and the creator and, currently, only maintainer of RoyalDao Libraries.

[QueenEDAO](https://queene.wtf/) was an innovative project inspired by [NounsDAO](https://nouns.wtf/) and using [Openzeppelin](https://www.openzeppelin.com/) Governance Contracts.

The innovation in the project falls into the fact that the collection is tied to real world events and can end at an unknown moment.
In this specific case, the death of Queen Elizabeth, who inspired the fictional Character QueenE.

So, we knew from the beginning that we would need to find a solution to keep the DAO running and Growing after the event, that came sooner than any of us imagined.

With this background, I envisioned the Senate pattern. Based in the Governor pattern, from [Openzeppelin](https://www.openzeppelin.com/), the Senate allows multiple tokens (at this point, only ERC721) to participate into one single DAO. So, no matter the project you have tokens from, if it is a member of the Senate, you can propose and vote in the same DAO.

The basic pattern is usable in beta and documentation is being done. You can see here some usage examples.

### Cloning

Clone the repository

```console
$ git clone https://github.com/RoyalDAO/examples.git
```

### Usage

Once cloned, you can bash into the directory of the example you want to use/test.

```console
$ cd ./RepublicSenateUpgradeable
```
Install all dependencies

```console
$ npm
```
or using yarn

```console
$ yarn
```

The repo is built with some standard testing that will be built over time.

Feel free to run those or built your own.

```console
$ yarn test
```

If you're new to smart contract development, i strongly recomend all the content made by [Sir Patrick Collins](https://www.youtube.com/c/PatrickCollins), but specially his [36h Course](https://www.youtube.com/watch?v=gyMwXuJrbJQ)...i swear it's woth it!

## Learn More

I am currently building the base docs of the library [here](https://royaldao.gitbook.io/royaldao-contracts/). Should be done soon, depending on how much i need to sleep or rest (it has been a while).
But you can learn a lot by this repo.


I urge you to take a look at [OpenZeppelins Knowledge base](https://docs.openzeppelin.com/)! It will help a lot in Smart Contracts Development learning path.

## Security

This project is maintained by [me mostly](https://github.com/rodriguesmvinicius), and developed following my questionable standard for code quality and security. So ,PLEASE, use common sense when doing anything that deals with real money! I take no responsibility for your implementation decisions and any security problems you might experience.

As soon i can leverage some funds from sponsorship (request pending approval from githubsponsors platform) i intend to audit everything, but 'till there, if you find any vulnerability, please contact us through security e-mail [sec.royaldao@gmail.com](mailto:sec.royaldao@gmail.com).

## Contribute

I will document the contributing process soon, but in the meanwhile you can email me at [royal dao.contracts@gmail.com](mailto:royal dao.contracts@gmail.com). Lets build!

## License

RoyalDao's Contracts is released under the [MIT License](LICENSE).
