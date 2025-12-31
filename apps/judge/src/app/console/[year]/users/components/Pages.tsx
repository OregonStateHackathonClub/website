import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@repo/ui/components/pagination";
import React from "react";

export default function Pages({
    totalPages,
    page,
    setPage,
}: {
    totalPages: number;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
    return (
        <Pagination className="pt-2">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        className="hover:bg-gray-800 hover:text-white"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                        if (pageNum === 1 || pageNum === totalPages) return true;
                        if (Math.abs(pageNum - page) <= 2) return true;
                        return false;
                    })
                    .map((pageNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && pageNum - prev > 1;

                        return (
                            <React.Fragment key={pageNum}>
                                {showEllipsis && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => setPage(pageNum)}
                                        className={`hover:bg-gray-800 hover:text-white ${
                                            page === pageNum
                                                ? "border-gray-700 bg-gray-900 text-white"
                                                : ""
                                        }`}
                                        isActive={page === pageNum}
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            </React.Fragment>
                        );
                    })}

                <PaginationItem>
                    <PaginationNext
                        className="hover:bg-gray-800 hover:text-white"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}