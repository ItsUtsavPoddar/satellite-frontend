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
        <Button className="text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
          Passes
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 text-zinc-100 border border-zinc-800 max-w-[90vw] max-h-[80vh] w-full overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-zinc-800 pb-4">
          <DialogTitle className="text-xl font-bold text-zinc-100">
            {satellite?.name || "Satellite"} Passes
          </DialogTitle>
        </DialogHeader>
        {!passes || passes.length === 0 ? (
          <div className="flex justify-center items-center h-64 flex-grow">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-grow">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-900 border-b border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="text-zinc-300 font-semibold">
                      Visibility
                    </TableHead>
                    <TableHead className="text-zinc-300 font-semibold">
                      Start
                    </TableHead>
                    <TableHead className="text-zinc-300 font-semibold">
                      Peak
                    </TableHead>
                    <TableHead className="text-zinc-300 font-semibold">
                      End
                    </TableHead>
                    <TableHead className="text-zinc-300 font-semibold">
                      Visible Period
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passes &&
                    passes.map((pass, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-zinc-900 hover:bg-zinc-900/50"
                      >
                        <TableCell
                          className={`font-bold ${
                            pass.isVisible
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {pass.isVisible ? "Visible" : "Not Visible"}
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono text-sm">
                          <div className="space-y-1">
                            <div className="text-zinc-400 text-xs">Time:</div>
                            <div>
                              {new Date(pass.startTime).toLocaleString("en-GB")}
                            </div>
                            <div className="text-zinc-500 text-xs mt-2">
                              Az: {pass.startAzimuth.toFixed(2)}° | El:{" "}
                              {pass.startElevation.toFixed(2)}°
                            </div>
                            <div className="text-zinc-500 text-xs">
                              Dist: {pass.startRange.toFixed(2)} km
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono text-sm">
                          <div className="space-y-1">
                            <div className="text-zinc-400 text-xs">Time:</div>
                            <div>
                              {new Date(pass.peakTime).toLocaleString("en-GB")}
                            </div>
                            <div className="text-zinc-500 text-xs mt-2">
                              Az: {pass.peakAzimuth.toFixed(2)}° | El:{" "}
                              {pass.peakElevation.toFixed(2)}°
                            </div>
                            <div className="text-zinc-500 text-xs">
                              Dist: {pass.peakRange.toFixed(2)} km
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono text-sm">
                          <div className="space-y-1">
                            <div className="text-zinc-400 text-xs">Time:</div>
                            <div>
                              {new Date(pass.endTime).toLocaleString("en-GB")}
                            </div>
                            <div className="text-zinc-500 text-xs mt-2">
                              Az: {pass.endAzimuth.toFixed(2)}° | El:{" "}
                              {pass.endElevation.toFixed(2)}°
                            </div>
                            <div className="text-zinc-500 text-xs">
                              Dist: {pass.endRange.toFixed(2)} km
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono text-sm">
                          <div className="space-y-1">
                            <div className="text-zinc-400 text-xs">Start:</div>
                            <div>
                              {new Date(pass.startTime).toLocaleTimeString(
                                "en-GB",
                              )}
                            </div>
                            <div className="text-zinc-400 text-xs mt-2">
                              End:
                            </div>
                            <div>
                              {new Date(pass.endTime).toLocaleTimeString(
                                "en-GB",
                              )}
                            </div>
                          </div>
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
