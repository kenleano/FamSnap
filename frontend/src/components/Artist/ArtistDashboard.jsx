import React from "react";
import Portfolio from "./Portfolio";
import AddService from "./AddService";
import ArtistSidePanel from "./ArtistSidePanel";
import AddBankInfoContainer from "./AddBankInfoContainer";

const ArtistDashboard = () => {
  return (
    <div className="min-h-screen w-full bg-blue-50 px-16 py-8">
      <div className="flex justify-center py-10"></div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row w-full justify-center">
          <div className="w-1/4">
            <ArtistSidePanel />
          </div>
          {/* Display Content */}
          <div className="w-3/4 mx-9">
            <Portfolio />
            <AddService />
            <AddBankInfoContainer />
            {/* <History/> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
