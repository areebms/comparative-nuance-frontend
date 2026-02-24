import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function BookPicker({ bookData, setBookData, onClose }) {
  const handleToggleBook = (bookId) => {
    setBookData((prevBookData) =>
      prevBookData.map((book) =>
        book.id === bookId ? { ...book, selected: !book.selected } : book,
      ),
    );
  };

  const handleSelectAll = () => {
    setBookData((prevBookData) =>
      prevBookData.map((book) => ({ ...book, selected: true })),
    );
  };

  const handleClearAll = () => {
    setBookData((prevBookData) =>
      prevBookData.map((book) => ({ ...book, selected: false })),
    );
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Select books to compare
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: 400 }}>
        <FormGroup>
          {bookData.map((book) => (
            <FormControlLabel
              key={book.id}
              control={
                <Checkbox
                  checked={book.selected || false}
                  onChange={() => handleToggleBook(book.id)}
                />
              }
              label={
                <Typography fontWeight={600}>
                  {book.id} - {book.label}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClearAll} variant="outlined">
          Clear
        </Button>
        <Button onClick={handleSelectAll} variant="outlined">
          Select all
        </Button>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
