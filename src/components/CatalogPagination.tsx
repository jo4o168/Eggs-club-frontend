import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "./ui/button";
import {paginationItems} from "@/utils/paginate";

type CatalogPaginationProps = {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    noun: string;
    onPageChange: (page: number) => void;
};

export function CatalogPagination({
    page,
    totalPages,
    total,
    pageSize,
    noun,
    onPageChange,
}: CatalogPaginationProps) {
    if (total === 0) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    const pages = paginationItems(page, totalPages);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
                Mostrando {start}–{end} de {total} {noun}
            </p>
            {totalPages > 1 && (
                <nav aria-label="Paginação" className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        <ChevronLeft className="w-4 h-4"/>
                        Anterior
                    </Button>
                    {pages.map((item, index) =>
                        item === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
                                …
                            </span>
                        ) : (
                            <Button
                                key={item}
                                type="button"
                                variant={item === page ? "outline" : "ghost"}
                                size="icon"
                                className="h-8 w-8 text-sm"
                                onClick={() => onPageChange(item)}
                                aria-current={item === page ? "page" : undefined}
                            >
                                {item}
                            </Button>
                        ),
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Próxima
                        <ChevronRight className="w-4 h-4"/>
                    </Button>
                </nav>
            )}
        </div>
    );
}

export const catalogGridClassName =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch";
