"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

export function Passes({ satelliteId }) {
  const satellites = useSelector((state) => state.satDataReducer);
  const satellite = satellites[satelliteId];
  const passes = satellite ? satellite.passes : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className=" text-white bg-[#1b0e5c]  hover:bg-[#161673]">
          Passes
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black text-white max-w-[90vw] max-h-[80vh] w-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{satellite?.name || "Satellite"} Passes</DialogTitle>
        </DialogHeader>
        {!passes || passes.length === 0 ? (
          <div className="flex justify-center items-center h-64 flex-grow">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className=" overflow-y-auto flex-grow">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1b0e5c]">
                    <TableHead>Visibility</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Peak</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Visible Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passes &&
                    passes.map((pass, index) => (
                      <TableRow key={index}>
                        <TableCell
                          className={`font-bold ${
                            pass.isVisible ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {pass.isVisible ? "Visible" : "Not Visible"}
                        </TableCell>
                        <TableCell>
                          Time:
                          {new Date(pass.startTime).toLocaleString("en-GB")}
                          <br />
                          Azimuth: {pass.startAzimuth.toFixed(2)}°
                          <br />
                          Elevation: {pass.startElevation.toFixed(2)}°
                          <br />
                          Dist_2_Sat: {pass.startRange.toFixed(2)} km
                        </TableCell>
                        <TableCell>
                          Time:{" "}
                          {new Date(pass.peakTime).toLocaleString("en-GB")}
                          <br />
                          Azimuth: {pass.peakAzimuth.toFixed(2)}°
                          <br />
                          Elevation: {pass.peakElevation.toFixed(2)}°
                          <br />
                          Dist_2_Sat: {pass.peakRange.toFixed(2)} km
                        </TableCell>

                        <TableCell>
                          Time: {new Date(pass.endTime).toLocaleString("en-GB")}
                          <br />
                          Azimuth: {pass.endAzimuth.toFixed(2)}°
                          <br />
                          Elevation: {pass.endElevation.toFixed(2)}°
                          <br />
                          Dist_2_Sat: {pass.endRange.toFixed(2)} km
                        </TableCell>
                        <TableCell>
                          Start:{" "}
                          {new Date(pass.startTime).toLocaleTimeString("en-GB")}
                          <br />
                          End:{" "}
                          {new Date(pass.endTime).toLocaleTimeString("en-GB")}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
