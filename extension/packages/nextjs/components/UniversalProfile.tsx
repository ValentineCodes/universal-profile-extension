import React from "react";
import Image from "next/image";
import identicon from "ethereum-blockies-base64";
import { useAccount } from "wagmi";
import { useUniversalProfile } from "~~/contexts/UniversalProfileContext";

/**
 * Displays the user's profile information including images,
 * name, account address, description, and tags. The component
 * uses the useProfile and useEthereum hooks to fetch profile
 * and account data, respectively.
 */
const UniversalProfile: React.FC = () => {
  const { profile } = useUniversalProfile();
  const account = useAccount();
  const identiconUrl = account.address ? identicon(account.address) : "";

  return (
    <div className={`relative bg-white rounded-lg shadow-lg p-4 mx-auto flex flex-col items-center`}>
      {profile?.backgroundImage && profile.backgroundImage.length > 0 && (
        <Image
          src={profile.backgroundImage[0].url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/")}
          alt="Background"
          className={`text-center rounded-lg absolute inset-0`}
          fill
          sizes="(max-width: 432px) 100vw"
          style={{
            objectFit: "cover",
          }}
        /> // Background image
      )}

      <div className="flex justify-center relative">
        <div
          className={`text-center w-24 h-24 bg-gray-200 rounded-full overflow-hidden relative border-4 border-white`}
        >
          {!profile?.profileImage || profile.profileImage.length === 0 ? (
            <div className="w-full h-full bg-gray-300 rounded-full"></div> // Show grey background if there is no image
          ) : (
            <Image
              src={profile.profileImage[0].url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/")}
              alt="Profile"
              className="rounded-full"
              fill
              sizes="(max-width: 768px) 100vw"
              priority={true}
              style={{
                objectFit: "cover",
              }}
            /> // Profile Image
          )}
        </div>
        <div
          className={`absolute w-[38px] h-[38px] bottom-0 right-[-0.3rem] bg-gray-200 rounded-full overflow-hidden border-4 border-white`}
        >
          {!profile?.profileImage || profile.profileImage.length === 0 || !identiconUrl ? (
            <div className="w-full h-full bg-gray-300 rounded-full"></div> // Show grey background if there is no image
          ) : (
            <Image
              src={identiconUrl}
              alt="Blockie"
              className="rounded-full"
              fill
              sizes="100vw"
              style={{
                objectFit: "cover",
              }}
            /> // Identicon
          )}
        </div>
      </div>

      <div className={`w-[400px] text-center mt-4 bg-white p-2 rounded-lg relative`}>
        <p className="text-lg font-semibold text-black">{profile?.name || "Anonymous"}</p>
        <p className="text-sm text-gray-600">{account.address || "0x"}</p>
        {profile?.description ? (
          <p className="text-sm text-gray-500 mt-2">{profile?.description}</p>
        ) : (
          <div className={`min-h-[120px] w-full bg-gray-300 mt-2 rounded-lg`}></div> // Profile Description
        )}

        {profile?.tags && (
          <div className="flex justify-center mt-2">
            {profile.tags.map((tag, index) => (
              <a
                key={`${tag}-${index}`}
                className=" my-1 bg-pink-200 text-pink-800 rounded-full px-2 py-1 mx-1 text-xs"
              >
                {tag}
              </a>
            ))}
          </div> // Profile Tags
        )}
      </div>
    </div>
  );
};

export default UniversalProfile;
