// Shared DTOs (Data Transfer Objects) for client-server communication

/**
 * Sheet DTO - Represents a sheet music document
 */
export interface SheetDto {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  date?: string;
  serviceType?: string;
}

/**
 * Sheet Upload Request DTO - Used when uploading a new sheet
 */
export interface SheetUploadRequestDto {
  title: string;
  date: string;
  serviceType: string;
  fileName: string;
  imageData: string;
}

/**
 * Sheet Upload Response DTO - Server response after upload attempt
 */
export interface SheetUploadResponseDto {
  success: boolean;
  sheet?: SheetDto;
  error?: string;
  path?: string;
}

/**
 * Sheets Response DTO - Server response for fetching all sheets
 */
export interface SheetsResponseDto {
  sheets: SheetDto[];
}

/**
 * Profile DTO - User profile information
 */
export interface ProfileDto {
  nickname: string;
  role: string;
  icon: string;
  favoriteCommands: string[];
}

/**
 * Command DTO - Commands sent between clients
 */
export interface CommandDto {
  emoji: string;
  text: string;
}

/**
 * Sheet Change DTO - Information about sheet music changes
 */
export interface SheetChangeDto {
  sheetId: string;
  pageNumber?: number;
}

/**
 * Drawing Path DTO - Structure for drawing paths
 */
export interface DrawingPathDto {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  opacity?: number;
}

/**
 * Drawing Data DTO - Structure for drawing annotations on sheet music
 */
export interface DrawingDataDto {
  sheetId: string;
  pageNumber: number;
  paths: DrawingPathDto[];
}

/**
 * Command Event DTO - Structure for command events
 */
export interface CommandEventDto {
  command: CommandDto;
  sender: ProfileDto;
}
