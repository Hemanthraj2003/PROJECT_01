"use client";
import { useState } from "react";
import { sampleApplication } from "./sampleData";
import Pagination from "@mui/material/Pagination";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/navigation";

type MaterialPaginationProps = {
  count: number;
  onChange: (page: number) => void;
};

function MaterialPagination({ count, onChange }: MaterialPaginationProps) {
  return (
    <div className="flex justify-center mt-4">
      <Pagination
        count={count}
        onChange={(event, page) => onChange(page)}
        color="primary"
        variant="outlined"
        shape="rounded"
        size="large"
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const newApplications = sampleApplication;

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentPageData = newApplications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const viewApplication = (id: number) => {
    router.push(`/application/${id}`);
    // alert("Application number: " + id);
  };

  return (
    <div className="flex-1 mt-5 flex-col w-[85vw] justify-center items-center m-auto">
      <Paper className="p-3 m-3">SEARCH AND FILTER GOES HERE</Paper>
      <div className="p-3 m-3">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-slate-300">
                <TableCell className="!font-semibold !max-w-20 truncate">
                  DATE
                </TableCell>
                <TableCell className="!font-semibold !max-w-[170px] truncate">
                  CAR
                </TableCell>
                <TableCell className="!font-semibold !max-w-20 truncate">
                  YEAR
                </TableCell>
                <TableCell className="!font-semibold !max-w-24 truncate">
                  CITY
                </TableCell>
                <TableCell className="!font-semibold !max-w-20 truncate">
                  PRICE
                </TableCell>
                <TableCell className="!font-semibold !max-w-20 truncate">
                  STATUS
                </TableCell>
                <TableCell className="!font-semibold !max-w-20 truncate">
                  VIEW
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.date}</TableCell>
                  <TableCell>{application.car_brand}</TableCell>
                  <TableCell>{application.model_year}</TableCell>
                  <TableCell>{application.owner_address}</TableCell>
                  <TableCell>{application.price}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        viewApplication(application.id);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <MaterialPagination
          count={Math.ceil(newApplications.length / itemsPerPage)}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
}
