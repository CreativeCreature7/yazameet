"use client";

import { api } from "@/trpc/react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ImageResize from "tiptap-extension-resize-image";
import Youtube from "@tiptap/extension-youtube";
import { Youtube as YoutubeIcon } from "lucide-react";

export default function AdminPosts() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageResize,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Image,
      BulletList,
      OrderedList,
      ListItem,
      Youtube.configure({
        controls: true,
        nocookie: true,
        modestBranding: true,
        HTMLAttributes: {
          class: "w-full aspect-video",
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] rounded-lg border p-4 prose prose-neutral dark:prose-invert max-w-none",
      },
    },
  });

  const { mutateAsync: getPresignedUrl } =
    api.media.getPresignedUrl.useMutation();

  const addImage = useCallback(
    async (file: File) => {
      if (!editor) return;

      try {
        const { uploadURL } = await getPresignedUrl({
          fileName: file.name,
          fileType: file.type,
        });

        // Upload the file to S3 using the presigned URL
        const { status } = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-type": file.type,
          },
        });

        if (status === 200) {
          // Get the final URL by removing the query parameters
          const finalImageUrl = uploadURL.split("?")[0]!;
          editor.chain().focus().setImage({ src: finalImageUrl }).run();
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error) {
        toast.error("Failed to upload image");
      }
    },
    [editor],
  );

  const { data: posts, refetch } = api.blog.getAll.useQuery();

  const deletePost = api.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully");
      void refetch();
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id });
    }
  };

  const handleEdit = (post: NonNullable<typeof posts>[0]) => {
    setTitle(post.title);
    setSlug(post.slug);
    setPublished(post.published);
    editor?.commands.setContent(post.content);
    setEditingId(post.id);
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  console.log(editingId);

  // Modify the createPost mutation to handle updates
  const createPost = api.blog.create.useMutation({
    onSuccess: () => {
      toast.success(
        editingId ? "Post updated successfully" : "Post created successfully",
      );
      setTitle("");
      setSlug("");
      setPublished(false);
      editor?.commands.clearContent();
      setEditingId(null);
      void refetch();
    },
    onError: () => {
      toast.error(
        editingId ? "Failed to update post" : "Failed to create post",
      );
    },
  });

  const updatePost = api.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully");
      void refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    const content = editor.getHTML();

    if (editingId) {
      updatePost.mutate({
        id: editingId,
        title,
        slug,
        content,
        published,
      });
    } else {
      createPost.mutate({
        title,
        slug,
        content,
        published,
      });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published">Published</Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={editor?.isActive("bold") ? "bg-muted" : ""}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={editor?.isActive("italic") ? "bg-muted" : ""}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={
                    editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""
                  }
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={
                    editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""
                  }
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  className={
                    editor?.isActive("heading", { level: 3 }) ? "bg-muted" : ""
                  }
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 3</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className={editor?.isActive("bulletList") ? "bg-muted" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className={editor?.isActive("orderedList") ? "bg-muted" : ""}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) void addImage(file);
                    };
                    input.click();
                  }}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = prompt("Enter YouTube URL");
                    if (url) {
                      editor?.commands.setYoutubeVideo({
                        src: url,
                      });
                    }
                  }}
                >
                  <YoutubeIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add YouTube Video</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <EditorContent editor={editor} />
        <Button type="submit" disabled={createPost.isPending}>
          {createPost.isPending ? "Creating/Updating..." : "Create/Update Post"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Posts</h2>
        <div className="grid gap-4">
          {posts?.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      post.published ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
