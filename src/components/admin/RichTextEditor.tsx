import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Loader2,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
  YoutubeIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export function RichTextEditor({ value, onChange, onUploadImage }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState('');
  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);
  const [imageInsertSelection, setImageInsertSelection] = useState<{ from: number; to: number } | null>(
    null,
  );
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Image,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'rich-editor min-h-[420px] rounded-b-[24px] border-0 px-5 py-5 text-base text-[#0B0D10] focus:outline-none',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white p-6 text-sm text-[#6D727A]">
        Loading editor...
      </div>
    );
  }

  const insertLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter link URL', previousUrl || 'https://');

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const resetImageDialog = () => {
    setIsImageDialogOpen(false);
    setImageSource('url');
    setImageUrl('');
    setImageAlt('');
    setSelectedImageFile(null);
    setImageError('');
    setIsUploadingInlineImage(false);
    setImageInsertSelection(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openImageDialog = () => {
    setImageInsertSelection({
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    });
    setImageError('');
    setIsImageDialogOpen(true);
  };

  const insertImageAtSelection = (src: string) => {
    const selection = imageInsertSelection || {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };

    editor
      .chain()
      .focus()
      .setTextSelection(selection)
      .setImage({
        src,
        alt: imageAlt.trim() || undefined,
      })
      .run();
  };

  const handleInsertImage = async () => {
    setImageError('');

    if (imageSource === 'url') {
      const trimmedUrl = imageUrl.trim();

      if (!trimmedUrl) {
        setImageError('Enter an image URL first.');
        return;
      }

      insertImageAtSelection(trimmedUrl);
      resetImageDialog();
      return;
    }

    if (!selectedImageFile) {
      setImageError('Choose an image from your computer first.');
      return;
    }

    if (!onUploadImage) {
      setImageError('Image uploads are not configured for this editor.');
      return;
    }

    try {
      setIsUploadingInlineImage(true);
      const uploadedImageUrl = await onUploadImage(selectedImageFile);
      insertImageAtSelection(uploadedImageUrl);
      resetImageDialog();
    } catch (uploadError) {
      setImageError(
        uploadError instanceof Error ? uploadError.message : 'Could not upload the image.',
      );
      setIsUploadingInlineImage(false);
    }
  };

  const insertYoutube = () => {
    const url = window.prompt('Paste a YouTube URL');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url.trim() });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => setSelectedImageFile(event.target.files?.[0] || null)}
      />

      <div className="overflow-hidden rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white">
        <div className="flex flex-wrap gap-2 border-b border-[rgba(11,13,16,0.08)] bg-[#F6F7F9] p-3">
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo2 className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo2 className="h-4 w-4" />}
        />
        <ToolbarButton
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="h-4 w-4" />}
        />
        <ToolbarButton
          label="H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          icon={<Heading3 className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<Bold className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<Italic className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          icon={<UnderlineIcon className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Bullet"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={<List className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Numbered"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon={<Quote className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          icon={<AlignLeft className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          icon={<AlignCenter className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          icon={<AlignRight className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Link"
          onClick={insertLink}
          active={editor.isActive('link')}
          icon={<Link2 className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Image"
          onClick={openImageDialog}
          icon={<ImagePlus className="h-4 w-4" />}
        />
        <ToolbarButton
          label="YouTube"
          onClick={insertYoutube}
          icon={<YoutubeIcon className="h-4 w-4" />}
        />
        </div>

        <EditorContent editor={editor} />
      </div>

      <Dialog
        open={isImageDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetImageDialog();
            return;
          }
          setIsImageDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add inline image</DialogTitle>
            <DialogDescription>
              Insert an image from an existing hosted URL or upload one from your computer.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={imageSource}
            onValueChange={(value) => {
              setImageSource(value as 'url' | 'upload');
              setImageError('');
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="inline-image-url">Image URL</Label>
                <Input
                  id="inline-image-url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://storage.googleapis.com/... or any hosted image URL"
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 pt-3">
              <div className="rounded-2xl border border-dashed border-[rgba(11,13,16,0.16)] bg-[#F6F7F9] p-5">
                <p className="text-sm font-medium text-[#0B0D10]">
                  Upload from your computer
                </p>
                <p className="mt-1 text-sm text-[#6D727A]">
                  The image will be uploaded to Firebase Storage, then inserted into the post.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingInlineImage}
                  >
                    <ImagePlus className="h-4 w-4" />
                    Choose image
                  </Button>
                  <span className="text-sm text-[#6D727A]">
                    {selectedImageFile ? selectedImageFile.name : 'No file selected'}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="inline-image-alt">Alt text</Label>
            <Input
              id="inline-image-alt"
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          {imageError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {imageError}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetImageDialog}
              disabled={isUploadingInlineImage}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleInsertImage()}
              disabled={isUploadingInlineImage}
              className="bg-[#0B0D10] text-white hover:bg-[#1A1D21]"
            >
              {isUploadingInlineImage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {imageSource === 'upload' ? 'Upload and insert' : 'Insert image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolbarButton({
  active = false,
  disabled = false,
  label,
  onClick,
  icon,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      disabled={disabled}
      className={active ? 'bg-[#0B0D10] text-white hover:bg-[#1A1D21]' : 'bg-white'}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
