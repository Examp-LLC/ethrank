import { useState } from "react";
// import { CopyIcon } from "./assets/CopyIcon";
// import { DiamondIcon } from "./assets/DiamondIcon";
// import { HareIcon } from "./assets/HareIcon";
import { EAS, SchemaEncoder, TransactionSigner } from "@ethereum-attestation-service/eas-sdk";
import { useAccount, usePrepareTransactionRequest } from "wagmi";
// import { ArrowSmallRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import { useEthersProvider, useEthersSigner } from '~~/utils/ethers'
import { useEthersSigner } from "../lib/ethers";
// import { notification } from "~~/utils/scaffold-eth";


const Attest = () => {

    const [visible, setVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [newMember, setNewMember] = useState("");
    const { address } = useAccount();
  
    const signer = useEthersSigner();
  
    const EASContractAddress = "0x4200000000000000000000000000000000000021";
    const eas = new EAS(EASContractAddress);
  
    // const fetchAttestation = async () => {
    //   console.log("fetchAttestation");
  
    //   eas.connect(signer);
  
    //   const uid = "0x5d2c7c3181cc055f20e7301608323d17fd813caf68a303a495e3853dc19b60b7";
  
    //   const attestation = await eas.getAttestation(uid);
  
    //   console.log("attestation: ", attestation);
    // };

    const signAttestation = async () => {
      console.log("signAttestation - New member: ", newMember);

      const currentSigner = await signer;
  
      if (newMember && address && currentSigner) {
        setIsLoading(true);
  
        try {
          eas.connect(currentSigner as TransactionSigner);
  
          const schemaEncoder = new SchemaEncoder("uint32 Score,uint8 Season,uint32 Rank");
          const encodedData = schemaEncoder.encodeData([
            { name: "Score", value: "0", type: "uint32" },
            { name: "Season", value: "0", type: "uint8" },
            { name: "Rank", value: "0", type: "uint32" }
          ]);
  
          // mainnet
          // const schemaUID = "";
          
          // sepolia
          const schemaUID = "0x4e3cd72e8534413031db49cf35ce829e911110cc98293a699e78063e4f4a64ef";
  
          const tx = await eas.attest(
            {
              schema: schemaUID,
              data: {
                recipient: address,
                expirationTime: BigInt(0),
                revocable: false,
                data: encodedData,
                value: BigInt(3432122320000)
              },
            },
            {
              gasLimit: 300000,
            },
          );
  
          const newAttestationUID = await tx.wait();
  
          console.log("New attestation UID:", newAttestationUID);
  
          // notification.success("Attestation signed successfully! UID: " + newAttestationUID);
          setNewMember("");
        } catch (e) {
          console.log("Error signing attestation: ", e);
          // notification.error("Error signing attestation: " + e);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    return <div className="flex bg-base-300 relative pb-10">
      {/* <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" /> */}
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-4xl`}>
          <div className="flex gap-5 bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
            <span className="text-3xl">👋🏻</span>
            <div className="text-lg">
              <div>
                Attest your ETHRank score to <a href="https://attest.sh/" target="_blank" className="text-primary font-bold" rel="noreferrer">
                  Ethereum Attestation Service (EAS)
                </a> on Optimism
              </div>
              <div className="mt-2">
                The schema is defined at
                <a
                  href="https://optimism.easscan.org/schema/view/0x3626f0deccc804b58b4427385bd574a2d0d8cdad5bfc6a89e42095f2d37ff57d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold"
                >
                  {" "}
                  EAS Schema Registry
                </a>
                .
              </div>
            </div>
          </div>
          <button
            className="btn btn-circle btn-ghost h-6 w-6 bg-base-200 bg-opacity-80 z-0 min-h-0 drop-shadow-md"
            onClick={() => setVisible(false)}
          >
            {/* x<XMarkIcon className="h-4 w-4" /> */}
            X
          </button>
        </div>

        <div className="text-sm flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-l sm:text-4xl text-black">Attest an ETHRank Score</span>

          <div className="text-sm mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              placeholder="Address or ENS"
              value={newMember ?? ""}
              onChange={value => {
                setNewMember(value.target.value)
              }}
            />
            <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
              <div className="flex rounded-full border-2 border-primary p-1">
                <button
                  className={`btn btn-primary rounded-full capitalize font-normal font-white w-35 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
                    isLoading ? "loading" : ""
                  }`}
                  disabled={isLoading || !newMember}
                  onClick={async () => await signAttestation()}
                >
                  {!isLoading && (
                    <>
                      Attest
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
}

export default Attest