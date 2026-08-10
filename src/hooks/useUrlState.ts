import { useCallback } from "react";
import {
  useSearchParams,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { DRIFT_SORTS, DEFAULT_DRIFT_SORT } from "../types/api";
import type { DriftSort } from "../types/api";

const DEFAULT_EXPRESSION = "market";
const VIEW = "overview";

function toSort(value: string | null): DriftSort {
  return (DRIFT_SORTS as readonly string[]).includes(value ?? "")
    ? (value as DriftSort)
    : DEFAULT_DRIFT_SORT;
}

export default function useUrlState() {
  const [params, setParams] = useSearchParams();
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const setParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === defaultValue) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const expression = params.get("q") ?? DEFAULT_EXPRESSION;
  const setExpression = useCallback(
    (value: string) => setParam("q", value, DEFAULT_EXPRESSION),
    [setParam],
  );

  const sort = toSort(params.get("sort"));
  const setSort = useCallback(
    (value: DriftSort) => setParam("sort", value, DEFAULT_DRIFT_SORT),
    [setParam],
  );

  const selectedBookId = bookId ?? null;

  const setSelectedBookId = useCallback(
    (book: number | null) => {
      navigate(
        {
          pathname: book !== null ? `/${VIEW}/${book}` : "/",
          search: location.search,
        },
        { replace: true },
      );
    },
    [navigate, location.search],
  );

  return {
    expression,
    setExpression,
    sort,
    setSort,
    selectedBookId,
    setSelectedBookId,
  };
}
