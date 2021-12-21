import { Transaction } from "src/database/models"
import { db as database } from "src/database"

function getValidTransactionApiResponse() {
  return {
    code: "0",
    data: [
      {
        bal: "0.1137230400017355",
        balChg: "-0.0000104355564226",
        billId: "392949279010222087",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000104355564226",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639958408760",
        type: "8",
      },
      {
        bal: "0.1137334755581581",
        balChg: "0.0000462923817015",
        billId: "392828512276738053",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000462923817015",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639929615727",
        type: "8",
      },
      {
        bal: "0.1136871831764566",
        balChg: "-0.0000162966610336",
        billId: "392707688081289217",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000162966610336",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639900808994",
        type: "8",
      },
      {
        bal: "0.1137034798374902",
        balChg: "-0.0000041533493793",
        billId: "392586891928956928",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000041533493793",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639872008947",
        type: "8",
      },
      {
        bal: "0.1137076331868695",
        balChg: "-0.0000134126897424",
        billId: "392466098700054528",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000134126897424",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639843209597",
        type: "8",
      },
      {
        bal: "0.1137210458766119",
        balChg: "-0.0000051951886872",
        billId: "392345299649458179",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000051951886872",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639814408859",
        type: "8",
      },
      {
        bal: "0.1137262410652991",
        balChg: "-0.0000313156369768",
        billId: "392224505371979778",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000313156369768",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639785609259",
        type: "8",
      },
      {
        bal: "0.1137575567022759",
        balChg: "-0.0000046659155286",
        billId: "392103708858937346",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000046659155286",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639756809126",
        type: "8",
      },
      {
        bal: "0.1137622226178045",
        balChg: "0.0000310341226674",
        billId: "391982940942659584",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000310341226674",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639728015811",
        type: "8",
      },
      {
        bal: "0.1137311884951371",
        balChg: "0.0000005324922266",
        billId: "391862143049691139",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000005324922266",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639699215349",
        type: "8",
      },
      {
        bal: "0.1137306560029105",
        balChg: "0.0000288525606607",
        billId: "391741348503777283",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000288525606607",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639670415685",
        type: "8",
      },
      {
        bal: "0.1137018034422498",
        balChg: "-0.0000036751246878",
        billId: "391620523440107521",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000036751246878",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639641608745",
        type: "8",
      },
      {
        bal: "0.1137054785669376",
        balChg: "0.0000019328366920",
        billId: "391499755372834818",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.000001932836692",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639612815394",
        type: "8",
      },
      {
        bal: "0.1137035457302456",
        balChg: "0.0000052635161254",
        billId: "391378958780100608",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000052635161254",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639584015242",
        type: "8",
      },
      {
        bal: "0.1136982822141202",
        balChg: "-0.0000011864369979",
        billId: "391258134035197955",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000011864369979",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639555208378",
        type: "8",
      },
      {
        bal: "0.1136994686511181",
        balChg: "-0.0000131245671561",
        billId: "391137340600774660",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000131245671561",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639526408979",
        type: "8",
      },
      {
        bal: "0.1137125932182742",
        balChg: "-0.0000027474149578",
        billId: "391016545668984837",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000027474149578",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639497609223",
        type: "8",
      },
      {
        bal: "0.113715340633232",
        balChg: "-0.0000692450128771",
        billId: "390895744919695361",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000692450128771",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639468808080",
        type: "8",
      },
      {
        bal: "0.1137845856461091",
        balChg: "0.0000069012887405",
        billId: "390774978920214528",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000069012887405",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639440015222",
        type: "8",
      },
      {
        bal: "0.1137776843573686",
        balChg: "-0.0000416712045024",
        billId: "390654155311968261",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000416712045024",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639411208630",
        type: "8",
      },
      {
        bal: "0.113819355561871",
        balChg: "0.000021898857769",
        billId: "390533387626377220",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.000021898857769",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639382415369",
        type: "8",
      },
      {
        bal: "0.113797456704102",
        balChg: "0.000000590476083",
        billId: "390412592338071554",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.000000590476083",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639353615528",
        type: "8",
      },
      {
        bal: "0.113796866228019",
        balChg: "-0.0000350892016991",
        billId: "390291773272256513",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000350892016991",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639324810018",
        type: "8",
      },
      {
        bal: "0.1138319554297181",
        balChg: "0.0000177045929249",
        billId: "390171001581105153",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000177045929249",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639296015803",
        type: "8",
      },
      {
        bal: "0.1138142508367932",
        balChg: "-0.0000099672115954",
        billId: "390050177415016451",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000099672115954",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639267209077",
        type: "8",
      },
      {
        bal: "0.1138242180483886",
        balChg: "0.0000034446252853",
        billId: "389929409230303233",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000034446252853",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639238415698",
        type: "8",
      },
      {
        bal: "0.1138207734231033",
        balChg: "0.0000048032096740",
        billId: "389808612222332928",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.000004803209674",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639209615447",
        type: "8",
      },
      {
        bal: "0.1138159702134293",
        balChg: "0.0000035773955220",
        billId: "389687819521912832",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.000003577395522",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639180816223",
        type: "8",
      },
      {
        bal: "0.1138123928179073",
        balChg: "-0.0000115583668250",
        billId: "389566996622503942",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.000011558366825",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639152009799",
        type: "8",
      },
      {
        bal: "0.1138239511847323",
        balChg: "-0.0926999600000000",
        billId: "389554404495618048",
        ccy: "BTC",
        execType: "",
        fee: "",
        from: "18",
        instId: "",
        instType: "",
        mgnMode: "",
        notes: "To Funding Account",
        ordId: "",
        pnl: "",
        posBal: "",
        posBalChg: "",
        subType: "12",
        sz: "-0.09269996",
        to: "6",
        ts: "1639149007602",
        type: "1",
      },
      {
        bal: "0.2065239111847323",
        balChg: "0.0003987476456073",
        billId: "389554390578917376",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000351963958891",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.0004339440414964",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "34",
        to: "",
        ts: "1639149004284",
        type: "2",
      },
      {
        bal: "0.206125163539125",
        balChg: "0.0001876459508741",
        billId: "389554390574723090",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000165630098301",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.0002042089607042",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "16",
        to: "",
        ts: "1639149004283",
        type: "2",
      },
      {
        bal: "0.2059375175882509",
        balChg: "0.0000234557438592",
        billId: "389554390574723089",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000020703762288",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.000025526120088",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "2",
        to: "",
        ts: "1639149004283",
        type: "2",
      },
      {
        bal: "0.2059140618443917",
        balChg: "0.0002814689263111",
        billId: "389554390574723088",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000248445147452",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.0003063134410563",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "24",
        to: "",
        ts: "1639149004283",
        type: "2",
      },
      {
        bal: "0.2056325929180806",
        balChg: "0.0002814689263111",
        billId: "389554390574723083",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000248445147452",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.0003063134410563",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "24",
        to: "",
        ts: "1639149004283",
        type: "2",
      },
      {
        bal: "0.2053511239917695",
        balChg: "-0.0000407407407407",
        billId: "389548657514803222",
        ccy: "BTC",
        execType: "M",
        fee: "-0.0000407407407407",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389519250653868032",
        pnl: "0",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "99",
        to: "",
        ts: "1639147637415",
        type: "2",
      },
      {
        bal: "0.2053918647325102",
        balChg: "-0.0000506172839506",
        billId: "389493057057615891",
        ccy: "BTC",
        execType: "M",
        fee: "-0.0000506172839506",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389485542672592896",
        pnl: "0",
        posBal: "0",
        posBalChg: "0",
        subType: "2",
        sz: "123",
        to: "",
        ts: "1639134381233",
        type: "2",
      },
      {
        bal: "0.2054424820164608",
        balChg: "-0.0000209876543210",
        billId: "389493057007284248",
        ccy: "BTC",
        execType: "M",
        fee: "-0.000020987654321",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389485542672592896",
        pnl: "0",
        posBal: "0",
        posBalChg: "0",
        subType: "2",
        sz: "51",
        to: "",
        ts: "1639134381221",
        type: "2",
      },
      {
        bal: "0.2054634696707818",
        balChg: "-0.0000197530864198",
        billId: "389493056977924105",
        ccy: "BTC",
        execType: "M",
        fee: "-0.0000197530864198",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389485542672592896",
        pnl: "0",
        posBal: "0",
        posBalChg: "0",
        subType: "2",
        sz: "48",
        to: "",
        ts: "1639134381214",
        type: "2",
      },
      {
        bal: "0.2054832227572016",
        balChg: "-0.0000316872427984",
        billId: "389493056927592461",
        ccy: "BTC",
        execType: "M",
        fee: "-0.0000316872427984",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389485542672592896",
        pnl: "0",
        posBal: "0",
        posBalChg: "0",
        subType: "2",
        sz: "77",
        to: "",
        ts: "1639134381202",
        type: "2",
      },
      {
        bal: "0.20551491",
        balChg: "0.20551491",
        billId: "389482649479442434",
        ccy: "BTC",
        execType: "",
        fee: "",
        from: "6",
        instId: "",
        instType: "",
        mgnMode: "",
        notes: "From Funding Account",
        ordId: "",
        pnl: "",
        posBal: "",
        posBalChg: "",
        subType: "11",
        sz: "0.20551491",
        to: "18",
        ts: "1639131899873",
        type: "1",
      },
    ],
    msg: "",
  }
}

function getValidTransactionFromApiResponse(apiResponse): Transaction[] {
  const transactions: Transaction[] = []

  if (apiResponse?.data) {
    for (const rawTransaction of apiResponse?.data) {
      const transaction: Transaction = {
        balance: Number(rawTransaction.bal),
        balanceChange: Number(rawTransaction.balChg),
        billId: rawTransaction.billId,
        currency: rawTransaction.ccy,
        executionType: rawTransaction.execType,
        fee: Number(rawTransaction.fee),
        fromAccountId: Number(rawTransaction.from),
        instrumentId: rawTransaction.instId,
        instrumentType: rawTransaction.instType,
        marginMode: rawTransaction.mgnMode,
        notes: rawTransaction.notes,
        orderId: rawTransaction.ordId,
        pnl: Number(rawTransaction.pnl),
        positionBalance: Number(rawTransaction.posBal),
        positionBalanceChange: Number(rawTransaction.posBalChg),
        billSubtypeId: Number(rawTransaction.subType),
        quantity: Number(rawTransaction.sz),
        toAccountId: Number(rawTransaction.to),
        timestamp: rawTransaction.ts,
        billTypeId: Number(rawTransaction.type),
      }

      if (!transaction.executionType) {
        delete transaction.executionType
      }
      if (!transaction.instrumentType) {
        delete transaction.instrumentType
      }
      if (!transaction.marginMode) {
        delete transaction.marginMode
      }

      transactions.push(transaction)
    }
  }

  return transactions
}

describe("TransactionsRepository", () => {
  describe("insertTransaction", () => {
    it("should create a row in the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      const aTransaction: Transaction = transactions[0]
      const result = await database.transactions.insert(aTransaction)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.balance).toBe(String(aTransaction.balance))
      expect(result.value.balanceChange).toBe(String(aTransaction.balanceChange))
      expect(result.value.billId).toBe(aTransaction.billId)
      expect(result.value.currency).toBe(aTransaction.currency)
      expect(result.value.billSubtypeId).toBe(aTransaction.billSubtypeId)
      expect(result.value.billTypeId).toBe(aTransaction.billTypeId)

      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBe(result.value.updatedTimestamp)

      // clear db
      await database.transactions.clearAll()
    })
  })
  describe("clearAllTransactions", () => {
    it("should truncate all rows from the database table", async () => {
      // insert data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.transactions.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const countResult = await database.transactions.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }
      expect(countResult.value).toBe(0)
    })
  })
  describe("getCount", () => {
    it("should count all rows from the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      let expectedCount = 0
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        ++expectedCount
      }

      // test functionality
      const countResult = await database.transactions.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      expect(countResult.value).toBe(expectedCount)
    })
  })
  describe("getTypeCount", () => {
    it("should count all rows from the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      const expectedCounts = {}
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        expectedCounts[transaction.billTypeId] =
          expectedCounts[transaction.billTypeId] + 1 || 1
      }

      for (const transactionType of Object.keys(expectedCounts)) {
        // test functionality
        const countResult = await database.transactions.getTypeCount(
          Number(transactionType),
        )
        expect(countResult).toBeTruthy()
        expect(countResult.ok).toBeTruthy()
        if (!countResult.ok) {
          return
        }

        // validate
        expect(countResult.value).toBe(expectedCounts[transactionType])
      }
    })
  })
  describe("fillTransactions", () => {
    it("should truncate all rows from the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }
    })
  })
})
